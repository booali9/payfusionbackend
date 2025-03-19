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
      // Log for debugging
      console.log(`Sending OTP ${otp} to ${phoneNumber}`);
      
      const message = await this.client.messages.create({
        body: `Your PayFusion verification code is: ${otp}. This code will expire in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      return message.sid;
    } catch (error) {
      console.error('SMS sending failed:', error);
      // Don't throw to prevent breaking the flow if SMS fails
      // Just log the error and continue
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

  // method 2
  // async sendDeviceChangeAlert(email, deviceInfo) {
  //   try {
  //     const mailOptions = {
  //       from: `"PayFusion" <${process.env.SMTP_USER}>`,
  //       to: email,
  //       subject: 'PayFusion Security Alert: New Device Login',
  //       html: `
  //         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  //           <h2 style="color: #1a73e8;">PayFusion Security Alert</h2>
  //           <p>Hello,</p>
  //           <p>We detected a sign-in to your PayFusion account from a new device:</p>
  //           <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
  //             <p><strong>Device:</strong> ${deviceInfo.name}</p>
  //             <p><strong>Type:</strong> ${deviceInfo.type}</p>
  //             <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
  //           </div>
  //           <p>If this was you, you can safely ignore this message.</p>
  //           <p>If you don't recognize this device, someone else might be trying to access your account. Please secure your account immediately by:</p>
  //           <ol>
  //             <li>Changing your password</li>
  //             <li>Enabling two-factor authentication (if not already enabled)</li>
  //             <li>Contacting our support team</li>
  //           </ol>
  //           <p>Thank you for helping keep your account secure.</p>
  //           <p>- The PayFusion Security Team</p>
  //         </div>
  //       `
  //     };
  
  //     return await this.transporter.sendMail(mailOptions);
  //   } catch (error) {
  //     console.error('Failed to send device change alert email:', error);
  //     // Don't throw to prevent breaking the flow if email fails
  //     return false;
  //   }
}

module.exports = new SMSService();