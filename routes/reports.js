const express = require("express");
const router = express.Router();

const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Customer = require("../models/Customer");


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

module.exports = router;
