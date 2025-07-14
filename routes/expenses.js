const express = require("express");
const router = express.Router();
const Expense = require("../models/expense");

// GET all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// POST a new expense
router.post("/", async (req, res) => {
  try {
    const { name, category, amount, date } = req.body;
    const newExpense = new Expense({ name, category, amount, date });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ error: "Failed to add expense" });
  }
});

// DELETE an expense
router.delete("/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

module.exports = router;
