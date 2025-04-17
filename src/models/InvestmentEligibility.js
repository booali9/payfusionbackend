const mongoose = require('mongoose');

const InvestmentEligibilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isEligible: {
    type: Boolean,
    default: false
  },
  minBalance: {
    type: Number,
    default: 500
  },
  kycVerified: {
    type: Boolean,
    default: false
  },
  minAccountAge: {
    type: Number, // days
    default: 30
  },
  risk: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  investmentOptions: [{
    name: String,
    minAmount: Number,
    maxAmount: Number,
    expectedReturn: String,
    duration: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('InvestmentEligibility', InvestmentEligibilitySchema);