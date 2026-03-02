const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
  },
  averagePreparationTime: {
    type: Number,   // in minutes
    default: 15,
  },
  category: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,   // URL or base64
    default: '',
  },
  order: {
    type: Number,   // for drag & drop position
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
