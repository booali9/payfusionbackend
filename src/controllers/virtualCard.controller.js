const VirtualCard = require('../models/VirtualCard');
const Wallet = require('../models/Wallet');
const virtualCardService = require('../services/virtualCard.service');
const { asyncHandler, ErrorResponse } = require('../utils/errorHandler');

exports.createVirtualCard = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { currency = 'USD' } = req.body;
  
  // Check if user already has a virtual card
  const existingCard = await VirtualCard.findOne({ userId, isActive: true });
  if (existingCard) {
    return next(new ErrorResponse('You already have an active virtual card', 400));
  }
  
  // Check if user has sufficient balance
  const wallet = await Wallet.findOne({ userId });
  if (!wallet || wallet.balance < 100) {
    return next(new ErrorResponse('Insufficient wallet balance. Minimum 100 USD required.', 400));
  }
  
  // Create virtual card
  const virtualCard = await virtualCardService.createVirtualCard(userId, currency);
  
  res.status(201).json({
    success: true,
    message: 'Virtual card created successfully for international transactions',
    data: {
      cardId: virtualCard._id,
      last4: virtualCard.last4,
      brand: virtualCard.brand,
      expiryMonth: virtualCard.expiryMonth,
      expiryYear: virtualCard.expiryYear,
      cardholderName: virtualCard.cardholderName,
      currency: virtualCard.currency,
      isInternational: virtualCard.isInternational,
      dailyLimit: virtualCard.dailyLimit,
      monthlyLimit: virtualCard.monthlyLimit
    }
  });
});

exports.getVirtualCards = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  
  const cards = await VirtualCard.find({ userId });
  
  res.status(200).json({
    success: true,
    count: cards.length,
    data: cards.map(card => ({
      cardId: card._id,
      last4: card.last4,
      brand: card.brand,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cardholderName: card.cardholderName,
      currency: card.currency,
      isActive: card.isActive,
      isInternational: card.isInternational,
      createdAt: card.createdAt
    }))
  });
});

exports.toggleCardStatus = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { cardId } = req.params;
  
  const card = await VirtualCard.findOne({ _id: cardId, userId });
  
  if (!card) {
    return next(new ErrorResponse('Virtual card not found', 404));
  }
  
  card.isActive = !card.isActive;
  await card.save();
  
  res.status(200).json({
    success: true,
    message: `Virtual card ${card.isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      cardId: card._id,
      isActive: card.isActive
    }
  });
});