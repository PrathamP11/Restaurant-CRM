const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
  },
  name: { type: String },
  price: { type: Number },
  qty: { type: Number, default: 1 },
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
  },
  type: {
    type: String,
    enum: ['dine-in', 'takeaway'],
    required: true,
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    default: null,
  },
  tableNumber: {
    type: Number,
    default: null,
  },
  items: [orderItemSchema],
  itemCount: {
    type: Number,
    default: 0,
  },
  // Customer details
  customerName: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  persons: { type: Number, default: 1 },

  cookingInstructions: { type: String, default: '' },

  revenue: {
    type: Number,
    default: 0,
  },
  // Chef assigned
  chefId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chef',
    default: null,
  },
  // Processing countdown in seconds
  processingTime: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['processing', 'done', 'not_picked'],
    default: 'processing',
  },
}, { timestamps: true });

// Auto-generate orderId before saving
orderSchema.pre('save', async function () {
  if (!this.orderId) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `ORD-${1000 + count + 1}`;
  } 
});

module.exports = mongoose.model('Order', orderSchema);
