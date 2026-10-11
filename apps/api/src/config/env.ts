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
    MONGODB_URI: z
      .string()
      .default(
        'mongodb+srv://mustafaattaebr_db_user:lmfbYaZnoed4NUGq@cluster0.ieotlx9.mongodb.net/arab_kids_code?retryWrites=true&w=majority&appName=Cluster0',
      ),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    JWT_ACCESS_SECRET: z
      .string()
      .default('arab_kids_code_super_secure_access_token_secret_key_2026'),
    JWT_ACCESS_EXPIRATION: z.string().default('15m'),
    JWT_REFRESH_SECRET: z
      .string()
      .default('arab_kids_code_super_secure_refresh_token_secret_key_2026'),
    JWT_REFRESH_EXPIRATION: z.string().default('7d'),
    COOKIE_SECRET: z
      .string()
      .default('arab_kids_code_super_secure_cookie_signing_secret_2026'),
    ADMIN_EMAIL: z.string().email().optional(),
    ADMIN_PASSWORD: z.string().min(8).optional(),
    ADMIN_NAME: z.string().default('م. مصطفى عطا'),
    ADMIN_PHONE: z.string().default('+201101587881'),
    INSTRUCTOR_WHATSAPP: z.string().default('+201101587881'),
    FRONTEND_SECURE_COOKIE: z.coerce.boolean().default(false),
  });

export const env = envSchema.parse(process.env);

