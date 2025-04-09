const twilio = require('twilio');

class SMSService {
  constructor() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        this.client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
      } else {
        // Create a mock client for testing
        this.client = {
          messages: {
            create: async () => ({ sid: 'mock-sid' })
          }
        };
      }
    } catch (error) {
      console.error('Failed to create Twilio client:', error);
      // Create a mock client for testing
      this.client = {
        messages: {
          create: async () => ({ sid: 'mock-sid' })
        }
      };
    }
  }

  async sendOTP(phoneNumber, otp) {
    try {
      if (!phoneNumber || !otp) {
        console.warn('Missing phone number or OTP');
        return false;
      }
      
      console.log(`Sending OTP ${otp} to ${phoneNumber}`);
      
      const message = await this.client.messages.create({
        body: `Your PayFusion verification code is: ${otp}. This code will expire in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER || '+10000000000',
        to: phoneNumber
      });
      
      return message.sid;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  async sendDeviceChangeAlert(phoneNumber, deviceInfo) {
    try {
      console.log(`Sending device change alert to ${phoneNumber} for device ${deviceInfo.name}`);
      
      const message = await this.client.messages.create({
        body: `PayFusion Security Alert: Your account was accessed from a new device: ${deviceInfo.name} (${deviceInfo.type}) at ${new Date().toLocaleString()}. If this wasn't you, please secure your account immediately.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      return message.sid;
    } catch (error) {
      console.error('SMS sending failed:', error);
      // Don't throw to prevent breaking the flow if SMS fails
      return false;
    }
  }

  // Second method commented out...
} // Add this closing brace for the class

module.exports = new SMSService();