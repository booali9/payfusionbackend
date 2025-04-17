const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { asyncHandler, ErrorResponse } = require('../utils/errorHandler');

exports.receiveMoneyRequest = asyncHandler(async (req, res, next) => {
  const receiverId = req.user.id;
  const { amount, description, senderEmail } = req.body;
  
  // Validate input
  if (!amount || amount <= 0) {
    return next(new ErrorResponse('Please provide a valid amount', 400));
  }
  
  // Generate payment reference
  const paymentReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  
  // Create a pending transaction
  const transaction = await Transaction.create({
    userId: receiverId,
    type: 'TRANSFER',
    status: 'PENDING',
    amount,
    currency: 'USD',
    description: description || 'Money request',
    reference: paymentReference,
    metadata: {
      type: 'RECEIVE_REQUEST',
      senderEmail: senderEmail || ''
    }
  });
  
  res.status(201).json({
    success: true,
    message: 'Money request created successfully',
    data: {
      requestId: transaction._id,
      paymentReference,
      amount,
      currency: transaction.currency,
      paymentLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pay/${paymentReference}`
    }
  });
});

exports.processReceivedMoney = asyncHandler(async (req, res, next) => {
  const { reference } = req.params;
  const { senderId, amount } = req.body;
  
  // Find the pending transaction
  const transaction = await Transaction.findOne({
    reference,
    status: 'PENDING'
  });
  
  if (!transaction) {
    return next(new ErrorResponse('Invalid or expired payment reference', 404));
  }
  
  // Verify the sender
  const sender = await User.findById(senderId);
  if (!sender) {
    return next(new ErrorResponse('Sender not found', 404));
  }
  
  // Find sender's wallet
  const senderWallet = await Wallet.findOne({ userId: senderId });
  if (!senderWallet || senderWallet.balance < amount) {
    return next(new ErrorResponse('Insufficient funds in sender wallet', 400));
  }
  
  // Find receiver's wallet
  const receiverWallet = await Wallet.findOne({ userId: transaction.userId });
  if (!receiverWallet) {
    return next(new ErrorResponse('Receiver wallet not found', 404));
  }
  
  // Update transaction status
  transaction.status = 'COMPLETED';
  transaction.metadata = { 
    ...transaction.metadata, 
    senderId,
    completedAt: new Date()
  };
  
  // Update wallets
  senderWallet.balance -= amount;
  receiverWallet.balance += amount;
  
  // Save all changes
  await Promise.all([
    transaction.save(),
    senderWallet.save(),
    receiverWallet.save()
  ]);
  
  res.status(200).json({
    success: true,
    message: 'Money received successfully',
    data: {
      transactionId: transaction._id,
      amount,
      currency: transaction.currency,
      senderName: sender.fullName,
      receiverName: req.user.fullName,
      completedAt: transaction.metadata.completedAt
    }
  });
});