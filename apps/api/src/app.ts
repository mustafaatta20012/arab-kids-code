import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import publicRoutes from './modules/public/public.routes';
import lessonRoutes from './modules/lessons/lesson.routes';
import parentRoutes from './modules/parent/parent.routes';
import adminRoutes from './modules/admin/admin.routes';
import billingRoutes from './modules/billing/billing.routes';
import { setupSwagger } from './config/swagger';
import { requestLogger } from './middleware/requestLogger';
import { sanitizeInput } from './middleware/sanitizer';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): Express => {
  const app = express();

  // Trust first proxy (e.g. Nginx, Cloudflare, Render, Railway)
  app.set('trust proxy', 1);

  // 1. Structured Logging & Correlation IDs
  app.use(requestLogger);

  // 2. Security Headers & CSP Configuration
  app.use(
    helmet({
      hsts:
        env.NODE_ENV === 'production'
          ? {
              maxAge: 31536000,
              includeSubDomains: true,
              preload: true,
            }
          : false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          frameSrc: ["'self'", 'https://scratch.mit.edu', 'https://accept.paymob.com'],
          connectSrc: ["'self'", env.CLIENT_URL, 'https:'],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // 3. Strict CORS & Parsing
  const allowedOrigins = [
    env.CLIENT_URL,
    ...(env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()) : []),
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. server-to-server, curl, health checks) or explicitly allowed origins
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked request from unauthorized origin: ${origin}`));
        }
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // 4. NoSQL & Prototype Injection Sanitization
  app.use(sanitizeInput);

  // 5. OpenAPI Swagger Docs (Disabled or secured in production)
  if (env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }

  // 6. Production Health Check & Monitoring Endpoints (Excluded from rate limit)
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'Arab Kids Code API',
      env: env.NODE_ENV,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  app.get(`${env.API_PREFIX}/health`, (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'Arab Kids Code API',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  // 7. Global API Rate Limiting
  app.use(env.API_PREFIX, apiLimiter);

  // 8. API v1 Domain Routes
  app.use(`${env.API_PREFIX}/auth`, authRoutes);
  app.use(`${env.API_PREFIX}/public`, publicRoutes);
  app.use(`${env.API_PREFIX}/lessons`, lessonRoutes);
  app.use(`${env.API_PREFIX}/me`, parentRoutes);
  app.use(`${env.API_PREFIX}/admin`, adminRoutes);
  app.use(`${env.API_PREFIX}/billing`, billingRoutes);

  // 9. Centralized Error Handling
  app.use(errorHandler);

  return app;
};
