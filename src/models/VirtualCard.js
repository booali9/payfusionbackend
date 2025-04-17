const mongoose = require('mongoose');

const VirtualCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true
  },
  cardholderName: {
    type: String,
    required: true
  },
  expiryMonth: {
    type: String,
    required: true
  },
  expiryYear: {
    type: String,
    required: true
  },
  cvv: {
    type: String,
    required: true,
    select: false
  },
  last4: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    default: 'Visa'
  },
  currency: {
    type: String,
    default: 'USD'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isInternational: {
    type: Boolean,
    default: true
  },
  dailyLimit: {
    type: Number,
    default: 2000
  },
  monthlyLimit: {
    type: Number,
    default: 10000
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  stripeCardId: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('VirtualCard', VirtualCardSchema);