const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  // Add the missing registrationStep field that you're referencing in your validation
  registrationStep: {
    type: String,
    enum: ['INITIAL', 'COMPLETE'],
    default: 'INITIAL'
  },
  phoneNumber: {
    type: String,
    required: function () {
      return this.registrationStep === 'COMPLETE';
    },
    unique: true,
    sparse: true // This allows multiple null values
  },
  password: {
    type: String,
    required: function () {
      return this.registrationStep === 'COMPLETE';
    },
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isKYCVerified: {
    type: Boolean,
    default: false
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id },
    config.jwtSecret,
    { expiresIn: config.jwtExpire }
  );
};

// Create the model only ONCE
const User = mongoose.model('User', UserSchema);

// Immediately invoked function to manage indexes
(async () => {
  try {
    // Drop the problematic index if it exists
    await User.collection.dropIndex('phoneNumber_1').catch(() => {
      // Ignore errors if index doesn't exist
      console.log('No existing phoneNumber index found or already dropped');
    });
    
    // Create a proper sparse index
    await User.collection.createIndex(
      { phoneNumber: 1 },
      { unique: true, sparse: true }
    );
    console.log('Successfully created sparse index for phoneNumber field');
  } catch (err) {
    console.error('Error managing indexes:', err);
  }
})();

// Export the model only ONCE
module.exports = User;