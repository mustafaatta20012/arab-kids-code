import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import express from 'express';

// ── Global crash handlers: log to Vercel function logs ──────────────────────
process.on('uncaughtException', (err) => {
  console.error('💥 [UNCAUGHT EXCEPTION]', err.message, err.stack);
});
process.on('unhandledRejection', (reason) => {
  console.error('💥 [UNHANDLED REJECTION]', reason);
});

let isDbConnected = false;

// Safely initialize the Express app — never throw (causes FUNCTION_INVOCATION_FAILED)
let app: express.Express;
try {
  app = createApp();
  console.log('✅ Express app initialized successfully');
} catch (err: any) {
  console.error('💥 [APP INIT FAILED]', err.message, err.stack);
  // Fallback: minimal app that returns the error details
  app = express();
  app.use((_req: any, res: any) => {
    res.status(500).json({
      success: false,
      code: 'APP_INIT_FAILED',
      message: err.message,
      stack: err.stack,
    });
  });
}


const ensureDb = async () => {
  if (!isDbConnected) {
    try {
      await connectDatabase();
      isDbConnected = true;
    } catch (err) {
      console.error('Failed to connect to MongoDB on startup/cold start:', err);
    }
  }
};

// Start standalone HTTP server when run in non-serverless environments
const isServerless = process.env.VERCEL === '1' || process.env.FUNCTION_TARGET || process.env.K_SERVICE;
if (!isServerless && env.NODE_ENV !== 'test') {

  ensureDb().then(() => {
    app.listen(env.PORT, () => {
      console.log(`🚀 Arab Kids Code API running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`📍 Health Check: http://localhost:${env.PORT}/health`);
      console.log(`📖 Swagger Documentation: http://localhost:${env.PORT}/api/v1/docs`);
    });
  });
}

// Export Express application instance for Vercel serverless execution
export default app;
export { app };

// Direct exports for CommonJS compatibility
module.exports = app;
(module.exports as any).default = app;
(module.exports as any).app = app;

