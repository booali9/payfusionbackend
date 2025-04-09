module.exports = {
  generateOTP: jest.fn().mockResolvedValue({
    success: true,
    otp: '123456'
  }),
  verifyOTP: jest.fn().mockResolvedValue({
    success: true,
    verified: true
  })
};