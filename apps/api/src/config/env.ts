import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';

// Load environment variables: check root monorepo .env or local .env
const rootEnvPath = path.resolve(__dirname, '../../../../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config(); // fallback to current working directory .env
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(5000),
    API_PREFIX: z.string().default('/api/v1'),
    CLIENT_URL: z.string().default('http://localhost:3000'),
    ALLOWED_ORIGINS: z.string().optional(),
    MONGODB_URI: z.string().default('mongodb://localhost:27017/arab_kids_code'),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    JWT_ACCESS_SECRET: z.string().default('default_jwt_access_secret_32_characters_minimum'),
    JWT_ACCESS_EXPIRATION: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().default('default_jwt_refresh_secret_32_characters_minimum'),
    JWT_REFRESH_EXPIRATION: z.string().default('7d'),
    COOKIE_SECRET: z.string().default('default_cookie_secret_key_32_chars'),
    ADMIN_EMAIL: z.string().email().optional(),
    ADMIN_PASSWORD: z.string().min(8).optional(),
    ADMIN_NAME: z.string().default('م. مصطفى عطا'),
    ADMIN_PHONE: z.string().default('+201101587881'),
    INSTRUCTOR_WHATSAPP: z.string().default('+201101587881'),
    FRONTEND_SECURE_COOKIE: z.coerce.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === 'production') {
        const isDefaultAccess = data.JWT_ACCESS_SECRET.includes('default_jwt_access_secret');
        const isDefaultRefresh = data.JWT_REFRESH_SECRET.includes('default_jwt_refresh_secret');
        const isDefaultCookie = data.COOKIE_SECRET.includes('default_cookie_secret');
        if (isDefaultAccess || isDefaultRefresh || isDefaultCookie) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        'CRITICAL SECURITY ERROR: Default JWT and Cookie secrets cannot be used in production. Please set strong 32+ character secrets in your production environment variables.',
      path: ['JWT_ACCESS_SECRET'],
    },
  );

export const env = envSchema.parse(process.env);

