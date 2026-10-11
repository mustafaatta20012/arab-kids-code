import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: env.NODE_ENV === 'test' ? 10000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'TOO_MANY_REQUESTS',
    message: 'تم تجاوز الحد الأقصى للطلبات المسموح بها، يرجى المحاولة لاحقاً',
  },
});

// Strict authentication rate limiter (login / register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: env.NODE_ENV === 'test' ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'تم تجاوز الحد المسموح به لمحاولات تسجيل الدخول، يرجى الانتظار 15 دقيقة قبل المحاولة مجدداً',
  },
});

// Checkout and payment creation limiter
export const billingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === 'test' ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'BILLING_RATE_LIMIT_EXCEEDED',
    message: 'تم تجاوز عدد محاولات الدفع المسموح بها مؤقتاً، يرجى التواصل مع الدعم الفني',
  },
});
