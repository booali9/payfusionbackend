const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const config = require('../config');

describe('Money Receive Controller Tests', () => {
  let token;
  let userId;
  let senderId;
  let paymentReference;
  
  beforeAll(async () => {
    // Create test user IDs and generate token
    userId = new mongoose.Types.ObjectId();
    senderId = new mongoose.Types.ObjectId();
    token = jwt.sign({ id: userId }, config.jwtSecret);
    paymentReference = `PAY-${Date.now()}-123456`;
    
    // Mock user
    jest.spyOn(User, 'findById').mockImplementation((id) => {
      if (id.toString() === userId.toString()) {
        return Promise.resolve({
          _id: userId,
          fullName: 'Receiver User',
          email: 'receiver@example.com'
        });
      }
      if (id.toString() === senderId.toString()) {
        return Promise.resolve({
          _id: senderId,
          fullName: 'Sender User',
          email: 'sender@example.com'
        });
      }
      return Promise.resolve(null);
    });
    
    // Mock wallet
    jest.spyOn(Wallet, 'findOne').mockImplementation((query) => {
      if (query.userId.toString() === userId.toString()) {
        return Promise.resolve({
          userId: userId,
          balance: 100,
          save: jest.fn().mockResolvedValue(true)
        });
      }
      if (query.userId.toString() === senderId.toString()) {
        return Promise.resolve({
          userId: senderId,
          balance: 500,
          save: jest.fn().mockResolvedValue(true)
        });
      }
      return Promise.resolve(null);
    });
  });
  
  afterAll(async () => {
    jest.restoreAllMocks();
  });
  
  test('should return 401 if no token provided', async () => {
    const response = await request(app).post('/api/receive-money/request');
    expect(response.status).toBe(401);
  });
  
  test('should create a money receive request', async () => {
    // Mock Transaction.create
    jest.spyOn(Transaction, 'create').mockResolvedValue({
      _id: 'trx_mock123',
      userId: userId,
      type: 'TRANSFER',
      status: 'PENDING',
      amount: 100,
      currency: 'USD',
      description: 'Test money request',
      reference: paymentReference
    });
    
    const response = await request(app)
      .post('/api/receive-money/request')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 100,
        description: 'Test money request',
        senderEmail: 'sender@example.com'
      });
      
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('paymentReference');
  });
});
