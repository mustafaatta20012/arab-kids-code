import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { connectDatabase } from './config/database';
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

  // 2. High-Priority CORS & Preflight Handling (Must execute before Helmet & body parsers)
  // Primary frontend: Firebase Hosting — arab-kids-code.web.app
  const allowedOrigins = [
    'https://arab-kids-code.web.app',       // Primary: Firebase Hosting
    'https://arab-kids-code.firebaseapp.com', // Firebase legacy domain
    'https://arab-kids-code.vercel.app',    // Vercel (admin/fallback)
    env.CLIENT_URL,                          // From environment variable
    'http://localhost:3000',
    'http://localhost:5173',
    ...(env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()) : []),
  ].filter(Boolean) as string[];

  const isOriginAllowed = (origin?: string): boolean => {
    if (!origin) return true; // Allow server-to-server / curl / Postman
    const lower = origin.toLowerCase().trim();
    return allowedOrigins.some((o) => o.toLowerCase() === lower);
  };

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, origin || true); // Echo exact origin back (required for credentials:true)
      } else {
        // Return false (no header) — do NOT throw Error (causes 500)
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Request-Id',
    ],
    exposedHeaders: ['Set-Cookie', 'X-Request-Id'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  // Handle OPTIONS preflight FIRST — before any other middleware
  app.options('*', cors(corsOptions));
  app.use(cors(corsOptions));

  // ── Fast Health Check (MUST be a separate Router mounted FIRST) ─────────────
  // app.use() middleware runs for ALL requests — health must bypass DB entirely
  const healthRouter = express.Router();
  for (const healthPath of ['/health', '/api/health', '/api/v1/health', '/v1/health']) {
    healthRouter.get(healthPath, (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'ok',
        service: 'Arab Kids Code API',
        env: env.NODE_ENV,
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'connecting/disconnected',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      });
    });
  }
  app.use(healthRouter);

  // 3. Security Headers & CSP Configuration
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
          connectSrc: ["'self'", ...allowedOrigins, 'https:'],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
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


  // Ensure DB connection on any request (critical for serverless cold starts)
  app.use(async (_req, _res, next) => {
    try {
      await connectDatabase();
    } catch (err) {
      console.error('Database connection error in middleware:', err);
    }
    next();
  });

  // 7. Global API Rate Limiting
  app.use(env.API_PREFIX, apiLimiter);

  // 8. API Domain Routes (Supporting /api/v1, /v1, and root for all reverse proxy setups)
  for (const prefix of ['/api/v1', '/v1', '']) {
    app.use(`${prefix}/auth`, authRoutes);
    app.use(`${prefix}/public`, publicRoutes);
    app.use(`${prefix}/lessons`, lessonRoutes);
    app.use(`${prefix}/me`, parentRoutes);
    app.use(`${prefix}/admin`, adminRoutes);
    app.use(`${prefix}/billing`, billingRoutes);
  }

  // 9. Centralized Error Handling
  app.use(errorHandler);

  return app;
};
