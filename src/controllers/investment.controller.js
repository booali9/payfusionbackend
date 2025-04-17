const User = require('../models/User');
const Wallet = require('../models/Wallet');
const KYC = require('../models/KYC');
const { asyncHandler, ErrorResponse } = require('../utils/errorHandler');

exports.checkInvestmentEligibility = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  
  // Get required user data
  const user = await User.findById(userId);
  const wallet = await Wallet.findOne({ userId });
  const kyc = await KYC.findOne({ userId });
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Calculate account age in days
  const accountAge = Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
  
  // Check eligibility criteria
  const hasKyc = user.isKYCVerified;
  const hasSufficientFunds = wallet && wallet.balance >= 500;
  const hasAccountMaturity = accountAge >= 30;
  
  // Determine if user is eligible
  const isEligible = hasKyc && hasSufficientFunds && hasAccountMaturity;
  
  // Create investment options based on wallet balance
  const investmentOptions = [];
  
  if (isEligible) {
    if (wallet.balance >= 500) {
      investmentOptions.push({
        name: 'Conservative Fund',
        minAmount: 500,
        expectedReturn: '3-5%',
        duration: '6 months',
        risk: 'LOW'
      });
    }
    
    if (wallet.balance >= 1000) {
      investmentOptions.push({
        name: 'Balanced Fund',
        minAmount: 1000,
        expectedReturn: '6-8%',
        duration: '1 year',
        risk: 'MEDIUM'
      });
    }
    
    if (wallet.balance >= 2500) {
      investmentOptions.push({
        name: 'Growth Fund',
        minAmount: 2500,
        expectedReturn: '9-12%',
        duration: '2 years',
        risk: 'HIGH'
      });
    }
  }
  
  res.status(200).json({
    success: true,
    data: {
      isEligible,
      eligibilityFactors: {
        kycVerified: hasKyc,
        sufficientFunds: hasSufficientFunds,
        accountMaturity: hasAccountMaturity,
        accountAge,
        requiredBalance: 500,
        currentBalance: wallet ? wallet.balance : 0
      },
      investmentOptions
    }
  });
});