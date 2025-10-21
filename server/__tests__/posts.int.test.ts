/// <reference types="jest" />
import request from 'supertest';
import app from '../src/server';
import mongoose from 'mongoose';
import { env } from '../src/config/env';

describe('Posts integration', () => {
  let token: string;
  let postId: string;

  beforeAll(async () => {
    if (!env.MONGO_URI) throw new Error('MONGO_URI required for tests');
    await mongoose.connect(env.MONGO_URI);

    // login with seeded admin or create one
    const login = await request(app).post('/api/auth/login').send({ email: process.env.ADMIN_SEED_EMAIL ?? env.ADMIN_SEED_EMAIL, password: process.env.ADMIN_SEED_PASS ?? env.ADMIN_SEED_PASS });
    token = login.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('create -> read -> update -> delete post', async () => {
    const createRes = await request(app).post('/api/posts').set('Authorization', `Bearer ${token}`).send({ content: 'Hello world' });
    expect(createRes.status).toBe(201);
    postId = createRes.body._id;

    const getRes = await request(app).get(`/api/posts/${postId}`).set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.content).toBe('Hello world');

    const updateRes = await request(app).put(`/api/posts/${postId}`).set('Authorization', `Bearer ${token}`).send({ content: 'Updated' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.content).toBe('Updated');

    const deleteRes = await request(app).delete(`/api/posts/${postId}`).set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toHaveProperty('success', true);
  }, 20000);
});
