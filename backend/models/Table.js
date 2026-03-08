const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String, 
    default: 'Table',
  },
  chairs: {
    type: Number,
    min: 2,
    max: 8,
    default: 2,
  },
  isReserved: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
