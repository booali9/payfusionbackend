const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['CARD', 'BANK_ACCOUNT', 'MOBILE_MONEY'],
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  details: {
    // For cards
    cardNumber: String,
    cardholderName: String,
    expiryMonth: String,
    expiryYear: String,
    last4: String,
    brand: String,
    
    // For bank accounts
    bankName: String,
    accountNumber: String,
    accountHolderName: String,
    routingNumber: String,
    
    // For mobile money
    provider: String,
    phoneNumber: String
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);