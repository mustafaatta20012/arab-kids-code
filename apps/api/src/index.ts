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
if (process.env.VERCEL !== '1' && env.NODE_ENV !== 'test') {
  ensureDb().then(() => {
    app.listen(env.PORT, () => {
      console.log(`🚀 Arab Kids Code API running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`📍 Health Check: http://localhost:${env.PORT}/health`);
      console.log(`📖 Swagger Documentation: http://localhost:${env.PORT}/api/v1/docs`);
    });
  });
}

// Serverless handler for Vercel
async function handler(req: any, res: any) {
  await ensureDb();
  return app(req, res);
}

// Direct function export for CommonJS runners
module.exports = handler;
(module.exports as any).default = handler;
(module.exports as any).app = app;

export default handler;
export { app };
