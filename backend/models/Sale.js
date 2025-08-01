const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  items: [{
    productId: { type: String, required: true },        // Consider using ObjectId and ref: 'Product'
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, required: true, enum: ['pending', 'paid', 'unpaid'], default: 'pending' },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
