const mongoose = require('mongoose');

const KYCSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  idType: {
    type: String,
    enum: ['PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID', 'OTHER'],
    required: true
  },
  idNumber: {
    type: String,
    required: true
  },
  idExpiryDate: {
    type: Date,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  frontIdImage: {
    type: String,
    required: true
  },
  backIdImage: {
    type: String,
    required: true
  },
  selfieImage: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  rejectionReason: {
    type: String
  },
  reviewedBy: {
    type: String
  },
  reviewDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('KYC', KYCSchema);