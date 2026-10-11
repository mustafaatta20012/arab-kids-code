import { createApp } from '../apps/api/src/app';
import { connectDatabase } from '../apps/api/src/config/database';

let isDbConnected = false;
const app = createApp();

export default async function handler(req: any, res: any) {
  if (!isDbConnected) {
    try {
      await connectDatabase();
      isDbConnected = true;
    } catch (err) {
      console.error('Failed to connect to MongoDB on serverless cold start:', err);
    }
  }
  return app(req, res);
}
