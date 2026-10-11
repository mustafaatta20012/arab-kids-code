import { Router } from 'express';
import { BillingController } from './billing.controller';
import { authenticate } from '../../middleware/auth';
import { billingLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Public webhook route (verified by cryptographic signature)
router.post('/webhook/:provider', BillingController.handleWebhook);

// Protected routes for parents
router.post('/checkout', authenticate, billingLimiter, BillingController.checkout);
router.get('/history', authenticate, BillingController.getHistory);

export default router;
