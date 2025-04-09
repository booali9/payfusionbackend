const express = require('express');
const { 
  register, 
  login, 
  verifyOTP, 
  requestPasswordReset, 
  resetPassword, 
  changeDevice,
  requestPhoneLogin,
  verifyPhoneLogin,
  verifyDeviceChange
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/verify-otp', verifyOTP);
router.post('/register', register);
router.post('/login', login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/change-device', authenticate, changeDevice);
router.post('/verify-device-change', authenticate, verifyDeviceChange);
router.post('/request-phone-login', requestPhoneLogin);
router.post('/verify-phone-login', verifyPhoneLogin);

module.exports = router;