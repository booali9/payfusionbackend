const OTP = require('../models/OTP');
const emailService = require('./email.service');
const smsService = require('./sms.service');

class OtpService {
  async generateOTP(userId, email, phoneNumber, purpose, expiresIn = 10) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + expiresIn * 60000);
    
    await OTP.findOneAndDelete({ userId, purpose });
    
    const newOTP = new OTP({
      userId,
      email,
      phoneNumber,
      otp,
      purpose,
      expiresAt
    });
    
    await newOTP.save();
    
    // Send OTP via both email and SMS
    try {
      await emailService.sendVerificationEmail(email, otp);
    } catch (error) {
      console.error('Email sending failed:', error);
    }
    
    try {
      await smsService.sendOTP(phoneNumber, otp);
    } catch (error) {
      console.error('SMS sending failed:', error);
    }
    
    return { otp };
  }
  
  async verifyOTP(userId, otp, purpose) {
    const otpRecord = await OTP.findOne({ 
      userId, 
      otp, 
      purpose,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpRecord) {
      return false;
    }
    
    await OTP.findOneAndDelete({ userId, purpose });
    return true;
  }
  
  async invalidateOTP(userId, purpose) {
    await OTP.findOneAndDelete({ userId, purpose });
    return true;
  }
}

module.exports = new OtpService();