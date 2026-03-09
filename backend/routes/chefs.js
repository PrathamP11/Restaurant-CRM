const express = require('express');
const router = express.Router();
const Chef = require('../models/Chef');

router.get('/', async (_req, res) => {
  try {
    const chefs = await Chef.find().sort({ createdAt: 1 });
    res.json(chefs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const chef = await Chef.create(req.body);
    res.status(201).json(chef);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


module.exports = router;
