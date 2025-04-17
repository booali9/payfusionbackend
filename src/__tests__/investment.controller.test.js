const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const KYC = require('../models/KYC');
const config = require('../config');

describe('Investment Controller Tests', () => {
  let token;
  let userId;
  
  beforeAll(async () => {
    // Create a test user and generate token
    userId = new mongoose.Types.ObjectId();
    token = jwt.sign({ id: userId }, config.jwtSecret);
    
    // Mock user, wallet, and KYC for testing
    jest.spyOn(User, 'findById').mockResolvedValue({
      _id: userId,
      fullName: 'Test User',
      email: 'test@example.com',
      isKYCVerified: true,
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) // 40 days ago
    });
    
    jest.spyOn(Wallet, 'findOne').mockResolvedValue({
      userId: userId,
      balance: 1500,
      currency: 'USD'
    });
    
    jest.spyOn(KYC, 'findOne').mockResolvedValue({
      userId: userId,
      status: 'APPROVED'
    });
  });
  
  afterAll(async () => {
    jest.restoreAllMocks();
  });
  
  test('should return 401 if no token provided', async () => {
    const response = await request(app).get('/api/investment/eligibility');
    expect(response.status).toBe(401);
  });
  
  test('should check investment eligibility with valid token', async () => {
    const response = await request(app)
      .get('/api/investment/eligibility')
      .set('Authorization', `Bearer ${token}`);
      
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.isEligible).toBe(true);
    expect(response.body.data.investmentOptions.length).toBeGreaterThan(0);
  });
});
