import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../src/app';

const app = createApp();
const request = supertest(app);

describe('Auth API Validation & Lockout Logic', () => {
  it('POST /api/v1/auth/login with invalid payload should return 400', async () => {
    const res = await request.post('/api/v1/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/auth/me without Bearer token should return 401 Unauthorized', async () => {
    const res = await request.get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });
});
