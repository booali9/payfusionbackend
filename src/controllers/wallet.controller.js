const PaymentMethod = require('../models/PaymentMethod');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { ErrorResponse } = require('../utils/errorHandler');
const stripeService = require('../services/stripe.service');

// Get wallet balance
exports.getWalletBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find user's wallet or create one if it doesn't exist
    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: 0,
        currency: 'USD'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        available: wallet.balance,
        pending: wallet.pendingBalance || 0,
        currency: wallet.currency || 'USD'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Deposit funds to wallet
exports.depositFunds = async (req, res, next) => {
  try {
    const { amount, paymentMethodId, currency = 'USD' } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }

    // Find user's wallet or create one
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: 0,
        currency
      });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      type: 'DEPOSIT',
      status: 'COMPLETED',
      amount,
      currency,
      paymentMethodId,
      description: req.body.description || 'Wallet deposit'
    });

    // Update wallet balance
    wallet.balance += amount;
    await wallet.save();

    res.status(200).json({
      success: true,
      message: 'Deposit successful',
      data: {
        transaction,
        newBalance: wallet.balance
      }
    });
  } catch (error) {
    next(error);
  }
};

// Withdraw funds from wallet
exports.withdrawFunds = async (req, res, next) => {
  try {
    const { amount, destinationId, currency = 'USD' } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }

    // Find user's wallet
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Check sufficient balance
    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds'
      });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      type: 'WITHDRAW',
      status: 'COMPLETED',
      amount,
      currency,
      destinationId,
      description: req.body.description || 'Wallet withdrawal'
    });

    // Update wallet balance
    wallet.balance -= amount;
    await wallet.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal successful',
      data: {
        transaction,
        newBalance: wallet.balance
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get transaction history
exports.getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, type } = req.query;
    
    const query = { userId };
    if (type) {
      query.type = type;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }
    };

    const transactions = await Transaction.find(query)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort);

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      data: transactions,
      pagination: {
        page: options.page,
        limit: options.limit,
        pages: Math.ceil(total / options.limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add a new payment method
exports.addPaymentMethod = async (req, res, next) => {
  try {
    const { type, details } = req.body;
    const userId = req.user.id;

    // Basic validation
    if (!type || !details) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type and payment details'
      });
    }

    // Create payment method
    const paymentMethod = await PaymentMethod.create({
      userId,
      type,
      details,
      // If first payment method, set as default
      isDefault: !(await PaymentMethod.countDocuments({ userId }))
    });

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: paymentMethod
    });
  } catch (error) {
    next(error);
  }
};

// Get all payment methods for a user
exports.getPaymentMethods = async (req, res, next) => {
  try {
    const paymentMethods = await PaymentMethod.find({ userId: req.user.id });

    res.status(200).json({
      success: true,
      count: paymentMethods.length,
      data: paymentMethods
    });
  } catch (error) {
    next(error);
  }
};

// Delete a payment method
exports.deletePaymentMethod = async (req, res, next) => {
  try {
    const paymentMethod = await PaymentMethod.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // Using deleteOne instead of remove (which is deprecated)
    await PaymentMethod.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Set a payment method as default
exports.setDefaultPaymentMethod = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // First, unset any existing default
    await PaymentMethod.updateMany(
      { userId },
      { isDefault: false }
    );
    
    // Then set the new default
    const paymentMethod = await PaymentMethod.findOneAndUpdate(
      { _id: req.params.id, userId },
      { isDefault: true },
      { new: true }
    );

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Default payment method updated',
      data: paymentMethod
    });
  } catch (error) {
    next(error);
  }
};

// Create Stripe checkout session
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    // Basic validation
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Please provide items for checkout'
      });
    }

    // Get or create Stripe customer
    const user = await User.findById(userId);
    let stripeCustomerId = user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await stripeService.createCustomer(
        user.fullName,
        user.email,
        user.phoneNumber
      );
      
      stripeCustomerId = customer.id;
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    // Create checkout session
    const session = await stripeService.createCheckoutSession(
      items,
      stripeCustomerId,
      { userId: userId.toString() }
    );

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Payment session error:', error);
    next(error);
  }
};

// Create payment setup intent for Stripe
exports.createPaymentMethod = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user.stripeCustomerId) {
      const customer = await stripeService.createCustomer(
        user.fullName,
        user.email,
        user.phoneNumber
      );
      
      user.stripeCustomerId = customer.id;
      await user.save();
    }
    
    // Create setup intent for adding payment method securely
    const setupIntent = await stripeService.createSetupIntent(user.stripeCustomerId);
    
    res.status(200).json({
      success: true,
      clientSecret: setupIntent.client_secret
    });
  } catch (error) {
    next(error);
  }
};

// Save a Stripe payment method
exports.savePaymentMethod = async (req, res, next) => {
  try {
    const { paymentMethodId, type, last4, brand } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'Stripe customer not found'
      });
    }

    // Attach payment method to customer in Stripe
    await stripeService.addPaymentMethod(paymentMethodId, user.stripeCustomerId);
    
    // Create a record in our database
    const paymentMethod = await PaymentMethod.create({
      userId,
      type: 'CARD',
      isDefault: !(await PaymentMethod.countDocuments({ userId })),
      details: {
        last4,
        brand,
        stripePaymentMethodId: paymentMethodId
      },
      isVerified: true
    });

    res.status(201).json({
      success: true,
      message: 'Payment method saved successfully',
      data: paymentMethod
    });
  } catch (error) {
    next(error);
  }
};