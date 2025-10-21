/// <reference types="jest" />
import request from 'supertest';
import app from '../src/server';
import mongoose from 'mongoose';
import { env } from '../src/config/env';

describe('Auth integration', () => {
  const email = `test+${Date.now()}@example.com`;
  const password = 'TestPass123!';

  beforeAll(async () => {
    mongoose.set('strictQuery', true);
    if (!env.MONGO_URI) {
      throw new Error('MONGO_URI is required for integration tests');
    }
    await mongoose.connect(env.MONGO_URI);
  });

  afterAll(async () => {
    // Close mongoose connection
    await mongoose.disconnect();
  });

  test('register -> login -> get /api/users/me', async () => {
    // Register
    const registerRes = await request(app).post('/api/auth/register').send({
      name: 'Integration Test',
      email,
      password,
      role: 'student'
    });

    expect([201, 409]).toContain(registerRes.status);

    // Login
    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    const token = loginRes.body.token;

    // Get /me
    const meRes = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body).toHaveProperty('email');
    expect(meRes.body.email).toBe(email.toLowerCase());
  }, 30000);
});
