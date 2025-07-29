const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// List all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('customer').populate('items.product').populate('payments');
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('customer').populate('items.product').populate('payments');
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create invoice and link to sale if saleId is provided
router.post('/', async (req, res) => {
  try {
    const { customer, items, dueDate, saleId } = req.body;
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }

    // Optionally, store reference to the sale in the invoice (recommended but optional)
    const invoiceData = { customer, items, total, dueDate };
    if (saleId) invoiceData.sale = saleId;

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // If this was created for a sale, update the sale to link the invoice
    if (saleId) {
      await Sale.findByIdAndUpdate(saleId, { invoiceId: invoice._id });
    }

    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update invoice
router.put('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record payment for invoice
router.post('/:id/payments', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    const { amount, method, note } = req.body;
    // Calculate total paid so far
    let totalPaid = 0;
    if (invoice.payments.length > 0) {
      const payments = await Payment.find({ _id: { $in: invoice.payments } });
      totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    }
    if (totalPaid + amount > invoice.total) {
      return res.status(400).json({ error: 'Payment exceeds invoice total' });
    }
    const payment = new Payment({ invoice: invoice._id, amount, method, note });
    await payment.save();
    invoice.payments.push(payment._id);
    // Update status
    const newTotalPaid = totalPaid + amount;
    if (newTotalPaid === invoice.total) {
      invoice.status = 'paid';
    } else if (newTotalPaid > 0) {
      invoice.status = 'partially_paid';
    }
    await invoice.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 