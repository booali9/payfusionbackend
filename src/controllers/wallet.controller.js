const PaymentMethod = require('../models/PaymentMethod');
const { ErrorResponse } = require('../utils/errorHandler');

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

    await paymentMethod.remove();

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