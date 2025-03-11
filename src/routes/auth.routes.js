const express = require('express');
const { register, login, verifyOTP, requestPasswordReset, resetPassword, changeDevice } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/change-device', authenticate, changeDevice);

module.exports = router;