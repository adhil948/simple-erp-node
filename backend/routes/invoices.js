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
    const invoices = await Invoice.find()
      .populate('customer')
      .populate('items.product')
      .populate('payments');
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer')
      .populate('items.product')
      .populate('payments');
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create invoice with payment schedule support
router.post('/', async (req, res) => {
  try {
    const { 
      customer, 
      items, 
      dueDate, 
      discount, 
      paymentSchedule, // New field
      saleId, 
      storeGst, 
      customerGst 
    } = req.body;

     console.log('Received paymentSchedule:', paymentSchedule); 
     
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }

    // Apply discount to get final total
    const finalTotal = Math.max(total - (discount || 0), 0);

    // Validate payment schedule if provided
    if (paymentSchedule && paymentSchedule.length > 0) {
      const totalScheduled = paymentSchedule.reduce((sum, schedule) => sum + (Number(schedule.amount) || 0), 0);
      
      if (Math.abs(totalScheduled - finalTotal) > 0.01) {
        return res.status(400).json({ 
          error: `Payment schedule total (${totalScheduled}) must equal invoice total (${finalTotal})` 
        });
      }

      // Validate individual schedule items
      for (let i = 0; i < paymentSchedule.length; i++) {
        const schedule = paymentSchedule[i];
        if (!schedule.amount || schedule.amount <= 0) {
          return res.status(400).json({ 
            error: `Payment schedule item ${i + 1}: Amount must be greater than 0` 
          });
        }
        if (!schedule.dueDate) {
          return res.status(400).json({ 
            error: `Payment schedule item ${i + 1}: Due date is required` 
          });
        }
      }
    }

    console.log('Creating invoice with saleId:', saleId);
    console.log('Payment schedule:', paymentSchedule);

    const invoiceData = { 
      customer, 
      items, 
      total, 
      dueDate, 
      discount, 
      paymentSchedule: paymentSchedule || [], // Include payment schedule
      storeGst, 
      customerGst 
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('customer')
      .populate('items.product');

    // If created for a sale, update the sale to link this invoice
    if (saleId) {
      await Sale.findByIdAndUpdate(saleId, { invoiceId: invoice._id });
    }

    res.status(201).json(populatedInvoice);
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update invoice with payment schedule support
router.put('/:id', async (req, res) => {
  try {
    const { paymentSchedule, discount, ...otherFields } = req.body;
    
    // If updating payment schedule, validate it
    if (paymentSchedule !== undefined) {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
      
      const finalTotal = Math.max(invoice.total - (discount !== undefined ? discount : invoice.discount || 0), 0);
      
      if (paymentSchedule.length > 0) {
        const totalScheduled = paymentSchedule.reduce((sum, schedule) => sum + (Number(schedule.amount) || 0), 0);
        
        if (Math.abs(totalScheduled - finalTotal) > 0.01) {
          return res.status(400).json({ 
            error: `Payment schedule total (${totalScheduled}) must equal invoice total (${finalTotal})` 
          });
        }
      }
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id, 
      { ...otherFields, discount, paymentSchedule }, 
      { new: true }
    ).populate('customer').populate('items.product');
    
    if (!updatedInvoice) return res.status(404).json({ error: 'Invoice not found' });
    
    res.json(updatedInvoice);
  } catch (err) {
    console.error('Error updating invoice:', err);
    res.status(400).json({ error: err.message });
  }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    // First, delete the invoice
    await Invoice.findByIdAndDelete(req.params.id);

    // Then, delete related payments
    await Payment.deleteMany({ invoice: req.params.id });

    res.json({ msg: 'Invoice and related payments deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Record payment for invoice (updated to work with payment schedules)
router.post('/:id/payments', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    
    const { amount, method, note, scheduleIndex } = req.body;

    // Total paid so far
    let totalPaid = 0;
    if (invoice.payments.length > 0) {
      const payments = await Payment.find({ _id: { $in: invoice.payments } });
      totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    }

    if (totalPaid + amount > invoice.total) {
      return res.status(400).json({ error: 'Payment exceeds invoice total' });
    }

    const payment = new Payment({ 
      invoice: invoice._id, 
      amount, 
      method, 
      note,
      scheduleIndex // Optional: to link payment to specific schedule item
    });
    await payment.save();

    invoice.payments.push(payment._id);

    // If payment is for a specific schedule item, update it
    if (scheduleIndex !== undefined && invoice.paymentSchedule && invoice.paymentSchedule[scheduleIndex]) {
      const schedule = invoice.paymentSchedule[scheduleIndex];
      schedule.paidAmount = (schedule.paidAmount || 0) + amount;
      schedule.paidDate = new Date();
      
      if (schedule.paidAmount >= schedule.amount) {
        schedule.status = 'paid';
      }
    }

    // Update overall invoice status
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

// NEW: Record payment against specific schedule item
router.post('/:id/schedule-payment', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    
    const { scheduleIndex, amount, method, note } = req.body;

    if (!invoice.paymentSchedule || !invoice.paymentSchedule[scheduleIndex]) {
      return res.status(400).json({ error: 'Invalid schedule index' });
    }

    // Use the invoice method we defined in the schema
    await invoice.recordScheduledPayment(scheduleIndex, amount, new Date());

    // Also create a payment record for tracking
    const payment = new Payment({ 
      invoice: invoice._id, 
      amount, 
      method, 
      note,
      scheduleIndex
    });
    await payment.save();

    invoice.payments.push(payment._id);
    await invoice.save();

    const updatedInvoice = await Invoice.findById(invoice._id)
      .populate('customer')
      .populate('items.product')
      .populate('payments');

    res.status(201).json({ payment, invoice: updatedInvoice });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// NEW: Get payment schedule status for an invoice
router.get('/:id/schedule-status', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const scheduleStatus = {
      hasSchedule: !!(invoice.paymentSchedule && invoice.paymentSchedule.length > 0),
      schedules: invoice.paymentSchedule || [],
      totalScheduled: (invoice.paymentSchedule || []).reduce((sum, s) => sum + s.amount, 0),
      totalPaid: (invoice.paymentSchedule || []).reduce((sum, s) => sum + (s.paidAmount || 0), 0),
      invoiceTotal: invoice.total
    };

    res.json(scheduleStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
