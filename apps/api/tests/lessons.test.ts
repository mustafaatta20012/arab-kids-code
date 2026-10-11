import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../src/app';
import { generateSignedVideoUrl, verifySignedVideoUrl } from '../src/utils/media';

const app = createApp();
const request = supertest(app);

describe('Lessons API & Server-Side Lock Enforcement', () => {
  it('GET /api/v1/lessons should return lessons list with unlock statuses', async () => {
    const res = await request.get('/api/v1/lessons');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    // Free lesson 1 is unlocked for visitors
    expect(res.body.data[0].isUnlocked).toBe(true);
    // Locked lesson 2 is locked for visitors
    expect(res.body.data[1].isUnlocked).toBe(false);
  });

  it('GET /api/v1/lessons/lesson-2 for visitor should be rejected with 403 LESSON_LOCKED', async () => {
    const res = await request.get('/api/v1/lessons/lesson-2');
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('LESSON_LOCKED');
    expect(res.body.success).toBe(false);
  });

  it('Signed video URL generator should produce valid signature and pass verification', () => {
    const videoId = 'lesson_1_video';
    const signedUrl = generateSignedVideoUrl(videoId);
    expect(signedUrl).toContain('token=');
    expect(signedUrl).toContain('expires=');

    const urlParams = new URLSearchParams(signedUrl.split('?')[1]);
    const token = urlParams.get('token')!;
    const expires = parseInt(urlParams.get('expires')!, 10);

    const isValid = verifySignedVideoUrl(`/videos/${videoId}.mp4`, token, expires);
    expect(isValid).toBe(true);
  });
});
