import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../src/app';

const app = createApp();
const request = supertest(app);

describe('Public API Endpoints', () => {
  it('GET /health should return 200 OK', async () => {
    const res = await request.get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/v1/public/course should return course statistics', async () => {
    const res = await request.get('/api/v1/public/course');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.instructor.name).toBe('م. مصطفى عطا');
  });

  it('GET /api/v1/public/lessons/free should return Lesson 1 info', async () => {
    const res = await request.get('/api/v1/public/lessons/free');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isFree).toBe(true);
  });
});
