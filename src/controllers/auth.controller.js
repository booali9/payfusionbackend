const User = require('../models/User');
const Device = require('../models/Device');
const OTP = require('../models/OTP');
const otpService = require('../services/otp.service');
const emailService = require('../services/email.service');
const smsService = require('./sms.service');

exports.register = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, password, deviceId, deviceName, deviceType } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or phone number already exists'
      });
    }

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password
    });

    await Device.create({
      userId: user._id,
      deviceId,
      deviceName,
      deviceType
    });

    // OTP service now handles both email and SMS delivery
    const otpResponse = await otpService.generateOTP(user._id, email, phoneNumber, 'VERIFICATION');
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. OTP sent to your email and phone.'
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { emailOrPhone, password, deviceId, deviceName, deviceType } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your account first'
      });
    }

    const device = await Device.findOne({
      userId: user._id,
      deviceId: deviceId
    });

    if (!device) {
      return res.status(403).json({
        success: false,
        message: 'Device not recognized. Please change device first.',
        requiresDeviceChange: true
      });
    }

    device.lastLogin = Date.now();
    await device.save();

    user.lastLogin = Date.now();
    await user.save();

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

exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, purpose } = req.body;

    const otpRecord = await OTP.findOne({
      email,
      otp,
      purpose,
      isUsed: false,
      expiresAt: { $gt: Date.now() }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    if (purpose === 'VERIFICATION') {
      await User.findByIdAndUpdate(otpRecord.userId, { isVerified: true });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

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
    const otpResponse = await otpService.generateOTP(user._id, user.email, user.phoneNumber, 'PASSWORD_RESET');
    
    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email and phone'
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpRecord = await OTP.findOne({
      email,
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

    otpRecord.isUsed = true;
    await otpRecord.save();

    const user = await User.findById(otpRecord.userId);
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

exports.changeDevice = async (req, res, next) => {
  try {
    const { deviceId, deviceName, deviceType } = req.body;
    const userId = req.user.id;

    // OTP service now handles both email and SMS delivery
    const otpResponse = await otpService.generateOTP(userId, req.user.email, req.user.phoneNumber, 'DEVICE_CHANGE');
    
    // Device info for alert
    const deviceInfo = {
      name: deviceName,
      type: deviceType,
      id: deviceId
    };
    
    // Send device change alerts
    await emailService.sendDeviceChangeAlert(req.user.email, deviceInfo);
    await smsService.sendDeviceChangeAlert(req.user.phoneNumber, deviceInfo);

    await Device.create({
      userId,
      deviceId,
      deviceName,
      deviceType,
      isActive: false
    });

    res.status(200).json({
      success: true,
      message: 'Device change initiated. Please verify with OTP sent to your email and phone.'
    });
  } catch (error) {
    next(error);
  }
};