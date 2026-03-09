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
  items: [orderItemSchema],
  itemCount: {
    type: Number,
    default: 0,
  },
  customerName: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  persons: { type: Number, default: 1 },

  cookingInstructions: { type: String, default: '' },

  revenue: {
    type: Number,
    default: 0,
  },
  chefId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chef',
    default: null,
  },
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

orderSchema.pre('save', async function () {
  if (!this.orderId) {
    const Counter = mongoose.model('Counter');
    const counter = await Counter.findByIdAndUpdate(
      'orderId',
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    this.orderId = `ORD-${counter.seq}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
