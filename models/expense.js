const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model("Expense", expenseSchema);
