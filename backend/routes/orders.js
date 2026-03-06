const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Table = require('../models/Table');
const Chef = require('../models/Chef');

// ── Helper: assign chef with fewest orders (random on tie) ──
async function assignChef() {
  const chefs = await Chef.find();
  if (!chefs.length) return null;
  const minOrders = Math.min(...chefs.map(c => c.orders));
  const candidates = chefs.filter(c => c.orders === minOrders);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// GET all orders (newest first)
router.get('/', async (req, res) => {
  try {
    const isReload = req.query.reload === 'true';

    if (isReload) {
      const processing = await Order.find({ status: 'processing' });
      for (const order of processing) {
        const nextStatus = order.type === 'takeaway' ? 'not_picked' : 'done';
        await Order.findByIdAndUpdate(order._id, { status: nextStatus });
        if (order.tableId) {
          await Table.findByIdAndUpdate(order.tableId, { isReserved: false });
        }
      }
    }

    const orders = await Order.find()
      .populate('chefId', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET analytics summary
router.get('/analytics', async (req, res) => {
  try {
    const { period } = req.query;
    const now = new Date();
    let since = new Date(0);

    if (period === 'daily')   since = new Date(now - 86400000);
    if (period === 'weekly')  since = new Date(now - 7 * 86400000);
    if (period === 'monthly') since = new Date(now - 30 * 86400000);

    const orders = await Order.find({ createdAt: { $gte: since } });

    const served   = orders.filter(o => o.status === 'done').length;
    const dineIn   = orders.filter(o => o.type === 'dine-in').length;
    const takeaway = orders.filter(o => o.type === 'takeaway').length;
    const revenue  = orders.reduce((s, o) => s + o.revenue, 0);

    const allOrders    = await Order.find();
    const totalClients = new Set(allOrders.map(o => o.phone)).size;
    const totalOrders  = allOrders.length;
    const totalRevenue = allOrders.reduce((s, o) => s + o.revenue, 0);

    res.json({ served, dineIn, takeaway, revenue, totalClients, totalOrders, totalRevenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET revenue graph data
router.get('/revenue', async (req, res) => {
  try {
    const { period } = req.query; // daily | weekly | monthly | yearly
    const now = new Date();
    const data = [];

    if (period === 'daily') {
      // 24 hourly buckets for today
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      for (let h = 0; h < 24; h++) {
        const start = new Date(todayStart);
        start.setHours(h, 0, 0, 0);
        const end = new Date(todayStart);
        end.setHours(h, 59, 59, 999);

        const orders  = await Order.find({ createdAt: { $gte: start, $lte: end } });
        const revenue = orders.reduce((s, o) => s + o.revenue, 0);
        // label: "1am", "2pm" etc
        const label = h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;
        data.push({ date: label, revenue });
      }

    } else if (period === 'weekly') {
      // 7 days
      for (let i = 6; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(start.getDate() - i);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);

        const orders  = await Order.find({ createdAt: { $gte: start, $lte: end } });
        const revenue = orders.reduce((s, o) => s + o.revenue, 0);
        data.push({ date: start.toISOString().split('T')[0], revenue });
      }

    } else if (period === 'monthly') {
      // days in current month
      const year  = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let d = 1; d <= daysInMonth; d++) {
        const start = new Date(year, month, d, 0, 0, 0, 0);
        const end   = new Date(year, month, d, 23, 59, 59, 999);

        const orders  = await Order.find({ createdAt: { $gte: start, $lte: end } });
        const revenue = orders.reduce((s, o) => s + o.revenue, 0);
        data.push({ date: String(d), revenue });
      }

    } else if (period === 'yearly') {
      // 12 months of current year
      const year = now.getFullYear();
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

      for (let m = 0; m < 12; m++) {
        const start = new Date(year, m, 1, 0, 0, 0, 0);
        const end   = new Date(year, m + 1, 0, 23, 59, 59, 999);

        const orders  = await Order.find({ createdAt: { $gte: start, $lte: end } });
        const revenue = orders.reduce((s, o) => s + o.revenue, 0);
        data.push({ date: monthNames[m], revenue });
      }
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create order
router.post('/', async (req, res) => {
  try {
    const { type, tableId, items, customerName, phone, address, persons, cookingInstructions } = req.body;

    const chef = await assignChef();
    if (!chef) return res.status(400).json({ message: 'No chefs available.' });

    const revenue        = items.reduce((s, i) => s + i.price * i.qty, 0);
    const totalPrepTime  = Math.min(items.reduce((s, i) => s + (i.averagePreparationTime || 5) * i.qty, 0), 15);
    const processingTime = totalPrepTime * 60;
    const itemCount      = items.reduce((s, i) => s + i.qty, 0);

    let tableNumber    = null;
    let assignedTableId = null;

    if (type === 'dine-in') {
      const partySize  = parseInt(persons) || 1;
      const bestTable  = await Table.findOne({ isReserved: false, chairs: { $gte: partySize } }).sort({ chairs: 1, tableNumber: 1 });
      if (!bestTable) return res.status(400).json({ message: 'No suitable table available for your party size.' });

      bestTable.isReserved = true;
      await bestTable.save();
      assignedTableId = bestTable._id;
      tableNumber     = bestTable.tableNumber;
    }

    const order = await Order.create({
      type, tableId: assignedTableId, tableNumber,
      items, itemCount, customerName, phone, address,
      persons: persons || 1, cookingInstructions: cookingInstructions || '',
      revenue, chefId: chef._id, processingTime, status: 'processing',
    });

    await Chef.findByIdAndUpdate(chef._id, { $inc: { orders: 1 } });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if ((status === 'done' || status === 'not_picked') && order.tableId) {
      await Table.findByIdAndUpdate(order.tableId, { isReserved: false });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
