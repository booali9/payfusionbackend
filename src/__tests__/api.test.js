const request = require('supertest');
const app = require('../../server');

describe('API Endpoints', () => {
    test('GET /api/health should return 200', async () => {
        const response = await request(app).get('/api/health');
        expect(response.statusCode).toBe(200);
    });
    
    // Update to match your actual route structure 
    test('GET /api/users/profile with auth should return 401 without token', async () => {
        const response = await request(app).get('/api/users/profile');
        expect(response.statusCode).toBe(401);
    });
});