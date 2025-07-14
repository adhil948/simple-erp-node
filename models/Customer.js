const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  company: { type: String },
  status: {
    type: String,
    enum: ["Lead", "Contacted", "Customer"],
    default: "Lead"
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Customer", customerSchema);
