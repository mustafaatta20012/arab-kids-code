import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';

let isDbConnected = false;
const app = createApp();

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

