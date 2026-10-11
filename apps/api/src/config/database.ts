import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';

// Fallback to Google DNS only on Windows local environments where ISP DNS blocks SRV lookups
if (process.platform === 'win32' && env.MONGODB_URI.startsWith('mongodb+srv://')) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (err) {
    // Ignore if not supported
  }
}

export const connectDatabase = async (retries = process.env.VERCEL ? 1 : 3, delayMs = 1500): Promise<typeof mongoose | null> => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }
  mongoose.set('strictQuery', true);

  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      console.log(`🍃 Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error: any) {
      console.warn(`⚠️ MongoDB connection attempt ${i}/${retries} failed: ${error.message}`);
      if (i < retries) {
        console.log(`⏳ Retrying MongoDB in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  console.error('❌ Could not connect to MongoDB after maximum retries. Continuing in offline mode.');
  return null;
};
