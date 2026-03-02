const express = require('express');
const router = express.Router();
const Chef = require('../models/Chef');

// GET all chefs
router.get('/', async (req, res) => {
  try {
    const chefs = await Chef.find().sort({ createdAt: 1 });
    res.json(chefs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create chef (seed only, 4 chefs fixed)
router.post('/', async (req, res) => {
  try {
    const chef = await Chef.create(req.body);
    res.status(201).json(chef);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH increment chef order count
router.patch('/:id/increment', async (req, res) => {
  try {
    const chef = await Chef.findByIdAndUpdate(
      req.params.id,
      { $inc: { orders: 1 } },
      { new: true }
    );
    res.json(chef);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
