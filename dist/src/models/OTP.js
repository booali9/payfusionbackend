const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['VERIFICATION', 'PASSWORD_RESET', 'DEVICE_CHANGE', 'PHONE_LOGIN'],
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600
  }
});

module.exports = mongoose.model('OTP', OTPSchema);