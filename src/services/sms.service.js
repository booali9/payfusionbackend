const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendOTP(phoneNumber, otp) {
    try {
      const message = await this.client.messages.create({
        body: `Your PayFusion verification code is: ${otp}. This code will expire in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      return message.sid;
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw new Error('Failed to send SMS');
    }
  }

  async sendDeviceChangeAlert(phoneNumber, deviceInfo) {
    try {
      const message = await this.client.messages.create({
        body: `PayFusion Security Alert: Your account was accessed from a new device: ${deviceInfo.name} at ${new Date().toLocaleString()}. If this wasn't you, please secure your account immediately.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      return message.sid;
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw new Error('Failed to send SMS');
    }
  }
}

module.exports = new SMSService();
