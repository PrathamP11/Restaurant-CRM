const express = require('express');
const router = express.Router();
const Table = require('../models/Table');
const Order = require('../models/Order');

// GET all tables — sync reservation status with active orders
router.get('/', async (req, res) => {
  try {
    // Find tables that actually have active (processing) dine-in orders
    const activeOrders = await Order.find({ type: 'dine-in', status: 'processing' });
    const activeTableIds = new Set(activeOrders.map(o => o.tableId?.toString()).filter(Boolean));

    // Unreserve tables with no active orders, reserve ones that do
    await Table.updateMany(
      { _id: { $nin: [...activeTableIds] } },
      { isReserved: false }
    );

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
    if (remaining.length > 0) {
      await Table.bulkWrite(
        remaining.map((t, i) => ({
          updateOne: {
            filter: { _id: t._id },
            update: { $set: { tableNumber: i + 1 } },
          },
        }))
      );
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
      { returnDocument: 'after' }
    );
    if (!table) {
      return res.status(404).json({ message: 'Table not found.' });
    }
    res.json(table);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
