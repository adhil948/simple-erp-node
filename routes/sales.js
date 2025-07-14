const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Product = require("../models/Product"); 


// ➕ Create a new sale (POST /api/sales)
router.post("/", async (req, res) => {
    try {
      const saleData = req.body;
  
      // Loop through all items in the sale
      for (const item of saleData.items) {
        const product = await Product.findOne({ name: item.productName });
  
        if (!product) {
          return res.status(404).json({ error: `Product "${item.productName}" not found in inventory.` });
        }
  
        if (product.quantity < item.quantity) {
          return res.status(400).json({
            error: `Not enough stock for "${item.productName}". Available: ${product.quantity}, Requested: ${item.quantity}`
          });
        }
  
        // Deduct stock
        product.quantity -= item.quantity;
        await product.save();
      }
  
      // Save the sale only after all products are successfully updated
      const newSale = new Sale(saleData);
      await newSale.save();
  
      res.status(201).json(newSale);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create sale." });
    }
  });
  
  
// 📄 Get all sales (GET /api/sales)
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Get a specific sale by ID (GET /api/sales/:id)
router.get("/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update a sale by ID (PUT /api/sales/:id)
router.put("/:id", async (req, res) => {
  try {
    const updated = await Sale.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!updated) return res.status(404).json({ error: "Sale not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete a sale by ID (DELETE /api/sales/:id)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Sale.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Sale not found" });
    res.json({ message: "Sale deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
