/// <reference types="jest" />
import request from 'supertest';
import app from '../src/server';
import mongoose from 'mongoose';
import { env } from '../src/config/env';

describe('Opportunities integration', () => {
  let token: string;
  let oppId: string;

  beforeAll(async () => {
    if (!env.MONGO_URI) throw new Error('MONGO_URI required for tests');
    await mongoose.connect(env.MONGO_URI);

    const login = await request(app).post('/api/auth/login').send({ email: process.env.ADMIN_SEED_EMAIL ?? env.ADMIN_SEED_EMAIL, password: process.env.ADMIN_SEED_PASS ?? env.ADMIN_SEED_PASS });
    token = login.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('create -> list -> get -> update -> approve -> delete opportunity', async () => {
    const createRes = await request(app).post('/api/opportunities').set('Authorization', `Bearer ${token}`).send({ title: 'Intern', company: 'ACME', description: 'Do stuff', type: 'Internship' });
    expect(createRes.status).toBe(201);
    oppId = createRes.body._id;

    const listRes = await request(app).get('/api/opportunities').set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);

    const getRes = await request(app).get(`/api/opportunities/${oppId}`).set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);

    const updateRes = await request(app).put(`/api/opportunities/${oppId}`).set('Authorization', `Bearer ${token}`).send({ title: 'Intern Updated' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.title).toBe('Intern Updated');

    // Approve as admin
    const approveRes = await request(app).put(`/api/opportunities/${oppId}/approve`).set('Authorization', `Bearer ${token}`);
    expect(approveRes.status).toBe(200);

    const deleteRes = await request(app).delete(`/api/opportunities/${oppId}`).set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toHaveProperty('success', true);
  }, 30000);
});
