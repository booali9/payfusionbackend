const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { addPaymentMethod, getPaymentMethods, deletePaymentMethod, setDefaultPaymentMethod } = require('../controllers/wallet.controller');
const router = express.Router();

// Use authentication middleware for all wallet routes
router.use(authenticate);

// Define placeholder routes for wallet functionality
// Replace with actual controller methods when they're implemented
router.get('/balance', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Wallet balance retrieved successfully',
    balance: {
      available: 0,
      pending: 0,
      currency: 'USD'
    }
  });
});

router.post('/deposit', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Deposit endpoint placeholder'
  });
});

router.post('/withdraw', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Withdrawal endpoint placeholder'
  });
});

router.get('/transactions', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Wallet transactions endpoint placeholder',
    transactions: []
  });
});

router.post('/payment-methods', addPaymentMethod);
router.get('/payment-methods', getPaymentMethods);
router.delete('/payment-methods/:id', deletePaymentMethod);
router.patch('/payment-methods/:id/set-default', setDefaultPaymentMethod);

module.exports = router;