const VirtualCard = require('../models/VirtualCard');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const stripeService = require('./stripe.service');

class VirtualCardService {
  async createVirtualCard(userId, currency = 'USD') {
    try {
      const user = await User.findById(userId);
      const wallet = await Wallet.findOne({ userId });
      
      if (!user || !wallet) {
        throw new Error('User or wallet not found');
      }
      
      // In a real implementation, we would integrate with a card issuing API
      // Here we're generating mock card details
      
      // Generate card number (for demo only - in production use a secure provider)
      const cardNumber = '4' + Math.random().toString().substr(2, 15);
      const last4 = cardNumber.slice(-4);
      
      // Set expiry date 3 years from now
      const now = new Date();
      const expiryMonth = String(now.getMonth() + 1).padStart(2, '0');
      const expiryYear = String(now.getFullYear() + 3).slice(-2);
      
      // Generate random CVV (again, in production use a secure provider)
      const cvv = Math.floor(100 + Math.random() * 900).toString();
      
      // Create virtual card in the database
      const virtualCard = new VirtualCard({
        userId,
        cardNumber,
        cardholderName: user.fullName,
        expiryMonth,
        expiryYear,
        cvv,
        last4,
        currency,
        walletId: wallet._id,
        isInternational: true
      });
      
      // If we have stripe integration
      if (user.stripeCustomerId) {
        try {
          // This is a placeholder - in reality we'd use Stripe's card issuing API
          const stripeCard = await stripeService.createSetupIntent(user.stripeCustomerId);
          virtualCard.stripeCardId = stripeCard.id;
        } catch (error) {
          console.error('Stripe card creation error:', error);
        }
      }
      
      await virtualCard.save();
      return virtualCard;
    } catch (error) {
      console.error('Virtual card creation error:', error);
      throw new Error('Failed to create virtual card');
    }
  }
}

module.exports = new VirtualCardService();