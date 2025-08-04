// routes/payment.js
const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

// GET /api/payments
// Query params supported: 
//   method, search, sortBy, sortOrder (asc/desc), dateFrom, dateTo
router.get('/', async (req, res) => {
  try {
    const { method, search, sortBy = 'date', sortOrder = 'desc', dateFrom, dateTo } = req.query;

    // Build filter object
    let filter = {};
    if (method) filter.method = method;
    if (search) {
      const regex = new RegExp(search, 'i');
      // Number search or text
      filter.$or = [
        { note: regex },
        { method: regex },
        { amount: isNaN(Number(search)) ? -1 : Number(search) }, // exact number match
      ];
    }
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Find
    const payments = await Payment.find(filter)
      .populate('invoice') // Remove this line if you don't want to populate invoice info
      .sort(sort);

    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
