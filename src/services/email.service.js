const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(email, otp) {
    const mailOptions = {
      from: `"PayFusion" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendDeviceChangeAlert(email, deviceInfo) {
    const mailOptions = {
      from: `"PayFusion" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'New Device Login Alert',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Device Login Detected</h2>
          <p>Your account was accessed from a new device:</p>
          <p><strong>Device:</strong> ${deviceInfo.name}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p>If this wasn't you, please secure your account immediately.</p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendKYCStatusEmail(email, status) {
    const mailOptions = {
      from: `"PayFusion" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'KYC Verification Status Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>KYC Verification Status</h2>
          <p>Your KYC verification status is: <strong>${status}</strong></p>
          <p>Log into your PayFusion account for more details.</p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();