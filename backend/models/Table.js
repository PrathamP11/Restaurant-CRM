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
    enum: [2, 3, 4, 6, 8],
    default: 3,
  },
  isReserved: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
