const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, enum: ['cash', 'card', 'bank', 'upi', 'other'], default: 'cash' },
  note: { type: String }
});

module.exports = mongoose.model('Payment', paymentSchema); 