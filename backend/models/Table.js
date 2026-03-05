const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    default: 'Table',
  },
  chairs: {
    type: Number,
    min: 1,
    max: 8,
    default: 3,
  },
  isReserved: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
