const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const walletController = require('../controllers/wallet.controller');

const router = express.Router();

// Use authentication middleware for all wallet routes
router.use(authenticate);

// Wallet core routes
router.get('/balance', walletController.getWalletBalance);
router.post('/deposit', walletController.depositFunds);
router.post('/withdraw', walletController.withdrawFunds);
router.get('/transactions', walletController.getTransactions);

// Payment method routes
router.post('/payment-methods', walletController.addPaymentMethod);
router.get('/payment-methods', walletController.getPaymentMethods);
router.delete('/payment-methods/:id', walletController.deletePaymentMethod);
router.patch('/payment-methods/:id/set-default', walletController.setDefaultPaymentMethod);

// Stripe integration routes
router.post('/checkout-session', walletController.createCheckoutSession);
router.post('/payment-method', walletController.createPaymentMethod);
router.post('/payment-methods/save', walletController.savePaymentMethod);

module.exports = router;