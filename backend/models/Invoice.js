const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [invoiceItemSchema],
  total: { type: Number, required: true },
  status: { type: String, enum: ['unpaid', 'partially_paid', 'paid'], default: 'unpaid' },
  dueDate: { type: Date, default: Date.now },
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  createdAt: { type: Date, default: Date.now },
    storeGSTIN: { type: String },
  customerGSTIN: { type: String }
  // Optionally, add sale ref here if needed: sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
