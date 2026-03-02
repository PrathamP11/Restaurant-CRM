const express = require('express');
const router = express.Router();
const Table = require('../models/Table');

// GET all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create new table
router.post('/', async (req, res) => {
  try {
    const count = await Table.countDocuments();
    if (count >= 30) {
      return res.status(400).json({ message: 'Maximum 30 tables allowed.' });
    }
    const table = await Table.create({
      ...req.body,
      tableNumber: count + 1,
    });
    res.status(201).json(table);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a table — reserved tables cannot be deleted
// After delete, renumber all remaining tables sequentially
router.delete('/:id', async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found.' });
    }
    if (table.isReserved) {
      return res.status(400).json({ message: 'Reserved tables cannot be deleted.' });
    }

    await Table.findByIdAndDelete(req.params.id);

    // Renumber remaining tables sequentially (1, 2, 3...)
    const remaining = await Table.find().sort({ tableNumber: 1 });
    for (let i = 0; i < remaining.length; i++) {
      await Table.findByIdAndUpdate(remaining[i]._id, { tableNumber: i + 1 });
    }

    const updated = await Table.find().sort({ tableNumber: 1 });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update table (reserve/unreserve)
router.patch('/:id', async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(table);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
