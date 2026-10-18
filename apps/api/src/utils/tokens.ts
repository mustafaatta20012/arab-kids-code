import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';
import { UserRole } from '@arab-kids-code/shared';

export interface TokenPayload {
  userId: string;
  role: UserRole;
  mustChangePassword?: boolean;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRATION as jwt.SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRATION as jwt.SignOptions['expiresIn'],
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};

export const setRefreshCookie = (res: Response, refreshToken: string): void => {
  const isProd = env.NODE_ENV === 'production';
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,                    // Must be true in production (HTTPS)
    sameSite: isProd ? 'none' : 'lax', // 'none' required for cross-origin (Firebase ↔ Vercel)
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
    path: '/api/v1/auth',
  });
};


export const clearRefreshCookie = (res: Response): void => {
  const isProd = env.NODE_ENV === 'production';
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/v1/auth',
  });
};
