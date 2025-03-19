const OTP = require('../models/OTP');
const emailService = require('./email.service');
const smsService = require('./sms.service');

class OtpService {
  async generateOTP(userId, email, phoneNumber, purpose, expiresIn = 10) {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + expiresIn * 60000);
    
    // Remove any existing OTP for this user and purpose
    await OTP.findOneAndDelete({ userId, purpose });
    
    // Create new OTP record
    const newOTP = new OTP({
      userId,
      email,
      phoneNumber,
      otp,
      purpose,
      expiresAt
    });
    
    await newOTP.save();
    
    // Send OTP via both email and SMS with proper error handling
    const promises = [];
    
    // Send via email for all purposes except where specifically not needed
    if (email) {
      let emailPromise;
      
      switch (purpose) {
        case 'VERIFICATION':
        case 'PASSWORD_RESET':
        case 'PHONE_LOGIN':
          emailPromise = emailService.sendVerificationEmail(email, otp);
          break;
        case 'DEVICE_CHANGE':
          // Device change alerts are handled separately
          break;
      }
      
      if (emailPromise) {
        promises.push(
          emailPromise.catch(error => {
            console.error('Email sending failed:', error);
            // Continue execution even if email fails
          })
        );
      }
    }
    
    // Send via SMS for all purposes
    if (phoneNumber) {
      promises.push(
        smsService.sendOTP(phoneNumber, otp).catch(error => {
          console.error('SMS sending failed:', error);
          // Continue execution even if SMS fails
        })
      );
    }
    
    // Wait for all notifications to be sent
    await Promise.all(promises);
    
    return { success: true };
  }
  
  async verifyOTP(userId, otp, purpose) {
    const otpRecord = await OTP.findOne({ 
      userId, 
      otp, 
      purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpRecord) {
      return false;
    }
    
    // Mark as used
    otpRecord.isUsed = true;
    await otpRecord.save();
    
    return true;
  }
  
  async invalidateOTP(userId, purpose) {
    await OTP.findOneAndDelete({ userId, purpose });
    return true;
  }
}

module.exports = new OtpService();