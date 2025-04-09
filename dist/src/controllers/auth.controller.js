// Add these new methods to the existing auth.controller.js

const User = require('../models/User');
const OTP = require('../models/OTP');
const Device = require('../models/Device');
const otpService = require('../services/otp.service');
const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');

// Keep existing methods, and add or update these:

exports.requestPhoneLogin = async (req, res, next) => {
  try {
    const { phoneNumber, deviceId, deviceName, deviceType } = req.body;

    // Check if user exists
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this phone number'
      });
    }

    // Generate OTP for phone login
    await otpService.generateOTP(user._id, user.email, phoneNumber, 'PHONE_LOGIN');

    res.status(200).json({
      success: true,
      message: 'OTP sent to your phone number',
      userId: user._id
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPhoneLogin = async (req, res, next) => {
  try {
    const { phoneNumber, otp, deviceId, deviceName, deviceType } = req.body;

    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      userId: user._id,
      otp,
      purpose: 'PHONE_LOGIN',
      isUsed: false,
      expiresAt: { $gt: Date.now() }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Check device
    let device = await Device.findOne({
      userId: user._id,
      deviceId
    });

    // If device doesn't exist, create it
    if (!device) {
      device = await Device.create({
        userId: user._id,
        deviceId,
        deviceName,
        deviceType,
        isActive: true
      });
    }

    // Update login timestamps
    device.lastLogin = Date.now();
    await device.save();

    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        isKYCVerified: user.isKYCVerified,
        onboardingCompleted: user.onboardingCompleted
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update requestPasswordReset method
exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { emailOrPhone } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // OTP service now handles both email and SMS delivery
    await otpService.generateOTP(user._id, user.email, user.phoneNumber, 'PASSWORD_RESET');

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email and phone',
      userId: user._id
    });
  } catch (error) {
    next(error);
  }
};

// Update resetPassword method
exports.resetPassword = async (req, res, next) => {
  try {
    const { emailOrPhone, otp, newPassword } = req.body;

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find and validate OTP
    const otpRecord = await OTP.findOne({
      userId: user._id,
      otp,
      purpose: 'PASSWORD_RESET',
      isUsed: false,
      expiresAt: { $gt: Date.now() }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

// Update changeDevice method
exports.changeDevice = async (req, res, next) => {
  try {
    const { deviceId, deviceName, deviceType } = req.body;
    const userId = req.user.id;

    // Check if this device is already registered
    const existingDevice = await Device.findOne({
      userId,
      deviceId
    });

    if (existingDevice) {
      return res.status(409).json({
        success: false,
        message: 'This device is already registered to your account'
      });
    }

    // Generate OTP for device change
    await otpService.generateOTP(userId, req.user.email, req.user.phoneNumber, 'DEVICE_CHANGE');

    // Device info for alert
    const deviceInfo = {
      name: deviceName,
      type: deviceType,
      id: deviceId
    };

    // Send device change alerts
    await emailService.sendDeviceChangeAlert(req.user.email, deviceInfo);
    await smsService.sendDeviceChangeAlert(req.user.phoneNumber, deviceInfo);

    // Create pending device record
    await Device.create({
      userId,
      deviceId,
      deviceName,
      deviceType,
      isActive: false // Will be activated after OTP verification
    });

    res.status(200).json({
      success: true,
      message: 'Device change initiated. Please verify with OTP sent to your email and phone.'
    });
  } catch (error) {
    next(error);
  }
};

// Add verifyDeviceChange method
// ... existing code ...

exports.verifyDeviceChange = async (req, res, next) => {
  try {
    const { otp, deviceId } = req.body;
    const userId = req.user.id;

    // Verify OTP
    const otpVerified = await otpService.verifyOTP(userId, otp, 'DEVICE_CHANGE');

    if (!otpVerified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Activate the new device
    await Device.findOneAndUpdate(
      { userId, deviceId, isActive: false },
      { isActive: true }
    );

    res.status(200).json({
      success: true,
      message: 'Device verified and activated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Define the verifyOTP function if it's not already defined
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, purpose } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify OTP
    const otpVerified = await otpService.verifyOTP(user._id, otp, purpose);
    
    if (!otpVerified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
    // If it's for email verification, mark user as verified
    if (purpose === 'VERIFICATION') {
      user.isVerified = true;
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Make sure to export register and login functions if they're defined earlier
exports.register = exports.register || (async (req, res, next) => {
  // Define if not already defined
});

exports.login = exports.login || (async (req, res, next) => {
  // Define if not already defined
});