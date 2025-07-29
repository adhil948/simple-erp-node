const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    items: [{
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, required: true, enum: ['pending', 'paid', 'unpaid'], default: 'pending' },
    // --- Add this line ---
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'invoice', default: null },
}, { timestamps: true });

module.exports = mongoose.model('sale', saleSchema);
