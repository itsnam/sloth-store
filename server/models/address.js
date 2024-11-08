const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addresses: [
    {
      fullName: {
        type: String,
        required: true
      },
      phoneNumber: {
        type: String,
        required: true
      },
      province: {
        type: String,
        required: true
      },
      district: {
        type: String,
        required: true
      },
      ward: {
        type: String,
        required: true
      },
      street: {
        type: String,
        required: true
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);