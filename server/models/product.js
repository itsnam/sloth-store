const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  sold: { type: Number, default: 0, min: 0 }
});

const productSchema = new mongoose.Schema({
  images: { type: [String], required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  sizes: { type: [String], required: true },
  colors: { type: [String], required: true },
  type: { type: String, required: true },
  inventory: [inventoryItemSchema]
});

module.exports = mongoose.model('Product', productSchema);