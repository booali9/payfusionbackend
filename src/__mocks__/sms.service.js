module.exports = {
  sendOTP: jest.fn().mockResolvedValue('mock-sid'),
  sendVerificationSMS: jest.fn().mockResolvedValue('mock-sid'),
  sendPasswordResetSMS: jest.fn().mockResolvedValue('mock-sid'),
  sendDeviceChangeAlert: jest.fn().mockResolvedValue('mock-sid')
};