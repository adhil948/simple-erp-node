const express = require("express");
const router = express.Router();

const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Payment = require('../models/Payment');


// GET /api/reports/summary
router.get("/summary", async (req, res) => {
  try {
    const totalSalesData = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalSales = totalSalesData[0]?.total || 0;

    const totalCustomers = await Customer.countDocuments();
    const totalProducts = await Product.countDocuments();

    const inventoryValueData = await Product.aggregate([
      { $project: { total: { $multiply: ["$price", "$quantity"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalInventoryValue = inventoryValueData[0]?.total || 0;

    const topProducts = await Sale.aggregate([
      { $unwind: "$items" },
      { $group: {
        _id: "$items.productName",
        totalQty: { $sum: "$items.quantity" }
      }},
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
      { $project: { productName: "$_id", totalQty: 1, _id: 0 } }
    ]);

    

    res.json({
      totalSales,
      totalCustomers,
      totalProducts,
      totalInventoryValue,
      topProducts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});


router.get("/sales-daily", async (req, res) => {
  try {
    const { start, end, productId } = req.query;

    // Build match stage for date range filter
    let matchStage = {};
    if (start && end) {
      matchStage.createdAt = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }

    // If productId is present, only sum that product in sales
    let aggregatePipeline;

    if (productId) {
      aggregatePipeline = [
        { $match: matchStage },
        { $unwind: "$items" },
        { $match: { "items.productId": productId } }, // productId must be stored as string!
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              productId: "$items.productId",
              productName: "$items.productName"
            },
            total: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
          }
        },
        { $sort: { "_id.date": 1 } }
      ];

      const sales = await Sale.aggregate(aggregatePipeline);

      // Respond with one dataset
      res.json(
        sales.map(s => ({
          date: s._id.date,
          total: s.total,
          productId: s._id.productId,
          productName: s._id.productName
        }))
      );
    } else {
      // No productId: group sales by day for ALL products
      aggregatePipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: { $sum: "$totalAmount" }
          }
        },
        { $sort: { "_id": 1 } }
      ];

      const sales = await Sale.aggregate(aggregatePipeline);

      res.json(
        sales.map(s => ({
          date: s._id,
          total: s.total
        }))
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load chart data" });
  }
});


// List all payments
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find().populate('invoice');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
