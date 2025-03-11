const Transaction = require('../models/Transaction');

exports.createTransaction = async (req, res, next) => {
  try {
    const { type, amount, currency, description, recipientInfo } = req.body;
    const userId = req.user.id;

    const transaction = await Transaction.create({
      userId,
      type,
      amount,
      currency,
      description,
      recipientInfo,
      deviceId: req.body.deviceId,
      reference: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
      status: 'PENDING'
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        transactionId: transaction._id,
        reference: transaction.reference,
        status: transaction.status
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const { type, status, limit = 10, page = 1 } = req.query;
    const userId = req.user.id;

    const query = { userId };
    if (type) query.type = type;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransactionDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await Transaction.findOne({
      _id: id,
      userId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};