module.exports = {
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    sendDeviceChangeAlert: jest.fn().mockResolvedValue(true),
    sendKYCStatusEmail: jest.fn().mockResolvedValue(true),
    transporter: {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-id' })
    }
  }; 