const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [invoiceItemSchema],
  discount: { type: Number, default: 0 }, // <------ Added discount field
  total: { type: Number, required: true },
  final:{type:Number,default:0},
  status: { type: String, enum: ['unpaid', 'partially_paid', 'paid'], default: 'unpaid' },
  dueDate: { type: Date, default: Date.now },
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  createdAt: { type: Date, default: Date.now },
  storeGSTIN: { type: String },
  customerGSTIN: { type: String }
  // sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' }
});

// Auto-calculate total on save
invoiceSchema.pre('save', function(next) {
  const subtotal = this.items.reduce(
    (acc, item) => acc + (item.price * item.quantity), 0
  );
  const discount = this.discount || 0;
  this.total = Math.max(subtotal - discount, 0);
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
