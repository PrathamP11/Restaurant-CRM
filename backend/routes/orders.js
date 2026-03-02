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
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  return chosen;
}

// GET all orders (newest first)
router.get('/', async (req, res) => {
  try {
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
    const { period } = req.query;  // daily | weekly | monthly
    const now = new Date();
    let since = new Date(0);

    if (period === 'daily') since = new Date(now - 86400000);
    if (period === 'weekly') since = new Date(now - 7 * 86400000);
    if (period === 'monthly') since = new Date(now - 30 * 86400000);

    const orders = await Order.find({ createdAt: { $gte: since } });

    const served = orders.filter(o => o.status === 'done').length;
    const dineIn = orders.filter(o => o.type === 'dine-in').length;
    const takeaway = orders.filter(o => o.type === 'takeaway').length;
    const revenue = orders.reduce((s, o) => s + o.revenue, 0);

    // Unique clients by phone
    const allOrders = await Order.find();
    const totalClients = new Set(allOrders.map(o => o.phone)).size;
    const totalOrders = allOrders.length;
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

    let days = 7;
    if (period === 'daily') days = 1;
    if (period === 'monthly') days = 30;
    if (period === 'yearly') days = 365;

    for (let i = days - 1; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const orders = await Order.find({ createdAt: { $gte: start, $lte: end } });
      const revenue = orders.reduce((s, o) => s + o.revenue, 0);
      data.push({ date: start.toISOString().split('T')[0], revenue });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create order (from user frontend)
router.post('/', async (req, res) => {
  try {
    const { type, tableId, items, customerName, phone, address, persons, cookingInstructions } = req.body;

    // Assign chef
    const chef = await assignChef();
    if (!chef) return res.status(400).json({ message: 'No chefs available.' });

    // Calculate revenue + processing time
    const revenue = items.reduce((s, i) => s + i.price * i.qty, 0);
    const maxPrepTime = Math.max(...items.map(i => i.averagePreparationTime || 15));
    const processingTime = maxPrepTime * 60; // convert to seconds

    // Calculate itemCount
    const itemCount = items.reduce((s, i) => s + i.qty, 0);

    let tableNumber = null;

    // If dine-in, reserve the table
    if (type === 'dine-in' && tableId) {
      const table = await Table.findByIdAndUpdate(
        tableId,
        { isReserved: true },
        { new: true }
      );
      tableNumber = table ? table.tableNumber : null;
    }

    const order = await Order.create({
      type, tableId: type === 'dine-in' ? tableId : null, tableNumber,
      items, itemCount, customerName, phone, address,
      persons: persons || 1, cookingInstructions: cookingInstructions || '',
      revenue, chefId: chef._id, processingTime, status: 'processing',
    });

    // Increment chef order count
    await Chef.findByIdAndUpdate(chef._id, { $inc: { orders: 1 } });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update order status (restaurant marks done/not_picked)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;  // 'done' | 'not_picked'
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    // If dine-in order is done, free the table
    if (status === 'done' && order.type === 'dine-in' && order.tableId) {
      await Table.findByIdAndUpdate(order.tableId, { isReserved: false });
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
