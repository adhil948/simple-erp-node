const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  // tax:{type:Number,default:0},
  category: { type: String },
  addedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", productSchema);
