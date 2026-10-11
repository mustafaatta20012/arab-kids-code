import crypto from 'crypto';
import { env } from '../config/env';

/**
 * Generate a signed, expiring URL for lesson videos.
 * Protects lesson video content from unauthorized hotlinking or permanent leaks.
 */
export const generateSignedVideoUrl = (
  videoId: string,
  rawVideoUrl?: string,
  expiresInSeconds: number = 7200, // 2 hours
): string => {
  const baseUrl = rawVideoUrl || `/videos/${videoId}.mp4`;
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  
  // Create HMAC SHA256 signature
  const secret = env.JWT_ACCESS_SECRET;
  const hash = crypto
    .createHmac('sha256', secret)
    .update(`${baseUrl}:${expires}`)
    .digest('hex');

  // Return signed URL with signature and expiration timestamp
  const delimiter = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${delimiter}token=${hash}&expires=${expires}`;
};

/**
 * Verify a signed video URL request
 */
export const verifySignedVideoUrl = (
  baseUrl: string,
  token: string,
  expires: number,
): boolean => {
  if (Math.floor(Date.now() / 1000) > expires) {
    return false; // Expired link
  }

  const secret = env.JWT_ACCESS_SECRET;
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(`${baseUrl}:${expires}`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedHash));
};
