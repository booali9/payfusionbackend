const OTP = require('../models/OTP');
const crypto = require('crypto');

class OtpService {
  async generateOTP(userId, purpose, expiresIn = 10) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + expiresIn * 60000);
    
    await OTP.findOneAndDelete({ userId, purpose });
    
    const newOTP = new OTP({
      userId,
      otp,
      purpose,
      expiresAt
    });
    
    await newOTP.save();
    return otp;
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