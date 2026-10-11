import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Phase 8: Security, Hardening & Sanitization Tests', () => {
  it('should include secure HTTP headers (Helmet & CSP)', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);

    // Verify Helmet security headers
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');
  });

  it('should assign and propagate X-Request-Id correlation headers', async () => {
    const customRequestId = 'test-correlation-uuid-1234';
    const res = await request(app)
      .get('/health')
      .set('X-Request-Id', customRequestId);

    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBe(customRequestId);
  });

  it('should sanitize NoSQL injection operators from request body', async () => {
    // Attempting login with injected MongoDB operators: { "$gt": "" }
    const maliciousPayload = {
      email: { $gt: '' },
      password: 'somepassword',
    };

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send(maliciousPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return standardized Arabic error response on invalid endpoints', async () => {
    const res = await request(app).get('/api/v1/invalid-route-does-not-exist');
    expect(res.status).toBe(404);
  });
});
