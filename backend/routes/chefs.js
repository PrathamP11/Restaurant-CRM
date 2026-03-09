const express = require('express');
const router = express.Router();
const Chef = require('../models/Chef');
const Order = require('../models/Order');

router.get('/', async (_req, res) => {
  try {
    const chefs = await Chef.find().sort({ createdAt: 1 });

    const counts = await Order.aggregate([
      { $group: { _id: '$chefId', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]));

    const result = chefs.map(c => ({
      ...c.toObject(),
      orders: countMap[c._id.toString()] || 0,
    }));

    res.json(result);
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
