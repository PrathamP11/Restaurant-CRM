const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// GET all menu items (sorted by drag & drop order)
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ order: 1, createdAt: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create menu item
router.post('/', async (req, res) => {
  try {
    const count = await MenuItem.countDocuments();
    const item = await MenuItem.create({ ...req.body, order: count });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update menu item
router.patch('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE menu item
router.delete('/:id', async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH reorder — receives array of { id, order }
router.patch('/reorder/bulk', async (req, res) => {
  try {
    const { items } = req.body;  // [{ id, order }, ...]
    for (const item of items) {
      await MenuItem.findByIdAndUpdate(item.id, { order: item.order });
    }
    const updated = await MenuItem.find().sort({ order: 1 });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
