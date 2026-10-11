import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';

const startServer = async () => {
  const app = createApp();

  if (env.NODE_ENV !== 'test') {
    await connectDatabase();
  }

  app.listen(env.PORT, () => {
    console.log(`🚀 Arab Kids Code API running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    console.log(`📍 Health Check: http://localhost:${env.PORT}/health`);
    console.log(`📖 Swagger Documentation: http://localhost:${env.PORT}/api/v1/docs`);
  });
};

startServer();
