const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      size: {
        type: String,  
        required: true,
      },
      color: {
        type: String,
        required: true,
      },
    },
  ],
  address: {
    type: mongoose.Schema.Types.ObjectId,
  },
  total: {
    type: Number,
    min: 0,
  },
  status: {
    type: Number,
    default: 1, 
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);