const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

// New payment schedule schema
const paymentScheduleSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  paidAmount: { type: Number, default: 0 },
  paidDate: { type: Date },
  description: { type: String } // Optional description for the payment
});

const invoiceSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [invoiceItemSchema],
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  final: { type: Number, default: 0 },
  status: { type: String, enum: ['unpaid', 'partially_paid', 'paid'], default: 'unpaid' },
  dueDate: { type: Date, default: Date.now },
  
  // Payment schedule array
  paymentSchedule: [paymentScheduleSchema],
  
  // Keep existing payments for backward compatibility
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  
  createdAt: { type: Date, default: Date.now },
  storeGSTIN: { type: String },
  customerGSTIN: { type: String }
});

// Enhanced pre-save middleware
invoiceSchema.pre('save', function(next) {
  const subtotal = this.items.reduce(
    (acc, item) => acc + (item.price * item.quantity), 0
  );
  const discount = this.discount || 0;
  this.total = Math.max(subtotal - discount, 0);
  this.final = this.total;
  
  // Update payment schedule statuses based on dates
  if (this.paymentSchedule && this.paymentSchedule.length > 0) {
    const currentDate = new Date();
    this.paymentSchedule.forEach(schedule => {
      if (schedule.status === 'pending' && schedule.dueDate < currentDate) {
        schedule.status = 'overdue';
      }
    });
    
    // Update overall invoice status based on payment schedule
    const totalScheduledAmount = this.paymentSchedule.reduce((sum, schedule) => sum + schedule.amount, 0);
    const totalPaidAmount = this.paymentSchedule.reduce((sum, schedule) => sum + schedule.paidAmount, 0);
    
    if (totalPaidAmount === 0) {
      this.status = 'unpaid';
    } else if (totalPaidAmount >= totalScheduledAmount) {
      this.status = 'paid';
    } else {
      this.status = 'partially_paid';
    }
  }
  
  next();
});

// Method to add a payment schedule
invoiceSchema.methods.addPaymentSchedule = function(schedules) {
  // Validate that total scheduled amount doesn't exceed invoice total
  const totalScheduled = schedules.reduce((sum, schedule) => sum + schedule.amount, 0);
  if (totalScheduled > this.total) {
    throw new Error('Total scheduled amount cannot exceed invoice total');
  }
  
  this.paymentSchedule = schedules;
  return this.save();
};

// Method to record a payment against a schedule
invoiceSchema.methods.recordScheduledPayment = function(scheduleIndex, paidAmount, paidDate = new Date()) {
  if (!this.paymentSchedule[scheduleIndex]) {
    throw new Error('Invalid schedule index');
  }
  
  const schedule = this.paymentSchedule[scheduleIndex];
  const newPaidAmount = schedule.paidAmount + paidAmount;
  
  if (newPaidAmount > schedule.amount) {
    throw new Error('Paid amount cannot exceed scheduled amount');
  }
  
  schedule.paidAmount = newPaidAmount;
  schedule.paidDate = paidDate;
  
  if (newPaidAmount >= schedule.amount) {
    schedule.status = 'paid';
  }
  
  return this.save();
};

module.exports = mongoose.model('Invoice', invoiceSchema);
