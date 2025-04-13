const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
  async createCheckoutSession(items, customerId, metadata = {}) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(item.amount * 100), // Convert dollars to cents
          },
          quantity: item.quantity || 1,
        })),
        mode: 'payment',
        customer: customerId || undefined,
        metadata,
        success_url: process.env.FRONTEND_URL ? 
          `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}` : 
          'http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: process.env.FRONTEND_URL ? 
          `${process.env.FRONTEND_URL}/payment/cancel` : 
          'http://localhost:3000/payment/cancel',
      });
      
      return session;
    } catch (error) {
      console.error('Stripe checkout error:', error);
      throw new Error('Payment session creation failed');
    }
  }

  async createPaymentIntent(amount, customerId, metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert dollars to cents
        currency: 'usd',
        customer: customerId || undefined,
        metadata,
      });
      
      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      throw new Error('Payment intent creation failed');
    }
  }

  async createCustomer(name, email, phone) {
    try {
      const customer = await stripe.customers.create({
        name,
        email,
        phone,
      });
      
      return customer;
    } catch (error) {
      console.error('Stripe customer creation error:', error);
      throw new Error('Customer creation failed');
    }
  }

  async addPaymentMethod(paymentMethodId, customerId) {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(
        paymentMethodId,
        { customer: customerId }
      );
      
      return paymentMethod;
    } catch (error) {
      console.error('Stripe payment method error:', error);
      throw new Error('Adding payment method failed');
    }
  }

  async createSetupIntent(customerId) {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
      });
      
      return setupIntent;
    } catch (error) {
      console.error('Stripe setup intent error:', error);
      throw new Error('Setup intent creation failed');
    }
  }
}

module.exports = new StripeService();