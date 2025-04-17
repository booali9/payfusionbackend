const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const VirtualCard = require('../models/VirtualCard');
const virtualCardService = require('../services/virtualCard.service');
const config = require('../config');

describe('Virtual Card Controller Tests', () => {
  let token;
  let userId;
  
  beforeAll(async () => {
    // Create a test user and generate token
    userId = new mongoose.Types.ObjectId();
    token = jwt.sign({ id: userId }, config.jwtSecret);
    
    // Mock user and wallet
    jest.spyOn(User, 'findById').mockResolvedValue({
      _id: userId,
      fullName: 'Test User',
      email: 'test@example.com',
      stripeCustomerId: 'cus_mock123'
    });
    
    jest.spyOn(Wallet, 'findOne').mockResolvedValue({
      userId: userId,
      balance: 500,
      currency: 'USD'
    });
    
    // Mock virtual card service
    jest.spyOn(virtualCardService, 'createVirtualCard').mockResolvedValue({
      _id: 'card_mock123',
      userId: userId,
      cardNumber: '4111111111111111',
      cardholderName: 'Test User',
      expiryMonth: '12',
      expiryYear: '25',
      cvv: '123',
      last4: '1111',
      brand: 'Visa',
      currency: 'USD',
      isActive: true,
      isInternational: true,
      dailyLimit: 2000,
      monthlyLimit: 10000
    });
  });
  
  afterAll(async () => {
    jest.restoreAllMocks();
  });
  
  test('should return 401 if no token provided', async () => {
    const response = await request(app).post('/api/virtual-cards');
    expect(response.status).toBe(401);
  });
  
  test('should create a virtual card with valid token', async () => {
    // Mock to ensure no existing card is found
    jest.spyOn(VirtualCard, 'findOne').mockResolvedValue(null);
    
    const response = await request(app)
      .post('/api/virtual-cards')
      .set('Authorization', `Bearer ${token}`)
      .send({ currency: 'USD' });
      
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('cardId');
  });
});
