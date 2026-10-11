import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../src/app';
import { BillingService } from '../src/modules/billing/billing.service';

const app = createApp();
const request = supertest(app);

describe('Billing, Webhooks & Idempotency Engine', () => {
  it('HMAC signature verification helper should return true for valid hash', () => {
    const payload = JSON.stringify({ amount: 450, order_id: 'test_123' });
    const secret = 'test_secret_key_123';
    const crypto = require('crypto');
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const isValid = BillingService.verifySignature(payload, signature, secret);
    expect(isValid).toBe(true);
  });

  it('POST /api/v1/billing/checkout without auth token should return 401', async () => {
    const res = await request.post('/api/v1/billing/checkout').send({
      studentId: '65d9f0000000000000000000',
      provider: 'paymob',
    });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('POST /api/v1/billing/webhook/paymob with valid mock order should be processed or handled idempotently', async () => {
    const webhookPayload = {
      providerRef: 'ORDER_TEST_9999',
      amount: 450,
      success: true,
    };

    const res = await request
      .post('/api/v1/billing/webhook/paymob')
      .send(webhookPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
