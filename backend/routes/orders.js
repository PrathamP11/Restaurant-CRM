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
    const orders = await Order.find()
      .populate('chefId', 'name')
      .populate('tableId', 'tableNumber')
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

    if (period === 'daily') since = new Date(now - 7 * 86400000);
    if (period === 'weekly') since = new Date(now.getFullYear(), now.getMonth(), 1);
    if (period === 'monthly') since = new Date(now.getFullYear(), 0, 1);

    const orders = await Order.find({ createdAt: { $gte: since } });

    const served = orders.filter(o => o.status === 'done' && o.type === 'dine-in').length;
    const dineIn = orders.filter(o => o.type === 'dine-in').length;
    const takeaway = orders.filter(o => o.type === 'takeaway').length;
    const revenue = orders.reduce((s, o) => s + o.revenue, 0);

    const [totals] = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$revenue' },
          phones: { $addToSet: '$phone' },
        },
      },
    ]);

    const totalOrders = totals?.totalOrders || 0;
    const totalRevenue = totals?.totalRevenue || 0;
    const totalClients = totals?.phones?.length || 0;

    res.json({ served, dineIn, takeaway, revenue, totalClients, totalOrders, totalRevenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET revenue graph data
router.get('/revenue', async (req, res) => {
  try {
    const { period } = req.query;
    const now = new Date();
    const data = [];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (period === 'daily') {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      const results = await Order.aggregate([
        { $match: { createdAt: { $gte: start } } },
        { $group: { _id: { $dayOfWeek: '$createdAt' }, revenue: { $sum: '$revenue' } } },
      ]);
      const revMap = {};
      results.forEach(r => { revMap[r._id] = r.revenue; });

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dow = d.getDay() + 1; // $dayOfWeek is 1=Sun
        data.push({ date: dayNames[d.getDay()], revenue: revMap[dow] || 0 });
      }

    } else if (period === 'weekly') {
      const year = now.getFullYear();
      const month = now.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const results = await Order.aggregate([
        { $match: { createdAt: { $gte: firstDay, $lte: new Date(lastDay.getTime() + 86399999) } } },
        { $group: { _id: { $week: '$createdAt' }, revenue: { $sum: '$revenue' } } },
      ]);
      const revMap = {};
      results.forEach(r => { revMap[r._id] = r.revenue; });

      let weekStart = new Date(firstDay);
      let week = 1;
      while (weekStart <= lastDay) {
        let weekEnd = new Date(weekStart);
        const daysUntilSunday = (7 - weekStart.getDay()) % 7;
        weekEnd.setDate(weekEnd.getDate() + daysUntilSunday);
        if (weekEnd > lastDay) weekEnd = new Date(lastDay);
        weekEnd.setHours(23, 59, 59, 999);
        const start = new Date(weekStart);
        start.setHours(0, 0, 0, 0);

        // Sum from aggregation results for this week's range
        const weekOrders = await Order.aggregate([
          { $match: { createdAt: { $gte: start, $lte: weekEnd } } },
          { $group: { _id: null, revenue: { $sum: '$revenue' } } },
        ]);
        data.push({ date: `W${week}`, revenue: weekOrders[0]?.revenue || 0 });

        weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() + 1);
        weekStart.setHours(0, 0, 0, 0);
        week++;
      }

    } else if (period === 'monthly') {
      const year = now.getFullYear();
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59, 999);

      const results = await Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$revenue' } } },
      ]);
      const revMap = {};
      results.forEach(r => { revMap[r._id] = r.revenue; });

      for (let m = 0; m < 12; m++) {
        data.push({ date: monthNames[m], revenue: revMap[m + 1] || 0 });
      }

    } else if (period === 'yearly') {
      const currentYear = now.getFullYear();
      const start = new Date(currentYear - 9, 0, 1);
      const end = new Date(currentYear, 11, 31, 23, 59, 59, 999);

      const results = await Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: { $year: '$createdAt' }, revenue: { $sum: '$revenue' } } },
      ]);
      const revMap = {};
      results.forEach(r => { revMap[r._id] = r.revenue; });

      for (let y = currentYear - 9; y <= currentYear; y++) {
        data.push({ date: String(y), revenue: revMap[y] || 0 });
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
    const { type, items, customerName, phone, address, persons, cookingInstructions } = req.body;

    const chef = await assignChef();
    if (!chef) return res.status(400).json({ message: 'No chefs available.' });

    const itemTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const deliveryCharge = type === 'takeaway' ? 50 : 0;
    const taxes = Math.round(itemTotal * 0.025);
    const revenue = itemTotal + deliveryCharge + taxes;
    const totalPrepTime = Math.min(items.reduce((s, i) => s + (i.averagePreparationTime || 5) * i.qty, 0), 15);
    const processingTime = totalPrepTime * 60;
    const itemCount = items.reduce((s, i) => s + i.qty, 0);

    let assignedTableId = null;

    if (type === 'dine-in') {
      const partySize = parseInt(persons) || 1;
      const bestTable = await Table.findOneAndUpdate(
        { isReserved: false, chairs: { $gte: partySize } },
        { isReserved: true },
        {
          sort: { chairs: 1, tableNumber: 1 },
          returnDocument: 'after'
        }
      );

      if (!bestTable) {
        return res.status(400).json({
          message: 'No suitable table available for your party size.'
        });
      }

      assignedTableId = bestTable._id;
    }

    const order = await Order.create({
      type,
      tableId: assignedTableId,
      items,
      itemCount,
      customerName,
      phone,
      address,
      persons: persons || 1,
      cookingInstructions: cookingInstructions || '',
      revenue,
      chefId: chef._id,
      processingTime,
      status: 'processing',
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
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });

    if ((status === 'done' || status === 'not_picked') && order.tableId) {
      await Table.findByIdAndUpdate(order.tableId, { isReserved: false });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
