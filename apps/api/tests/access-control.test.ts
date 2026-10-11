import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app';
import { User } from '../src/models';
import { generateAccessToken } from '../src/utils/tokens';
import { UserRole } from '@arab-kids-code/shared';
import { connectDatabase } from '../src/config/database';

const app = createApp();
const request = supertest(app);

describe('Access Control & Teacher Approval System', () => {
  let teacherToken: string;
  let teacherId: string;
  let testUserId: string;
  let testUserToken: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await connectDatabase(2, 500);
    }

    if (mongoose.connection.readyState === 1) {
      const tSalt = await bcrypt.genSalt(10);
      const tHash = await bcrypt.hash('TeacherPass123!', tSalt);
      const teacher = await User.create({
        name: 'المعلم المشرف',
        email: `teacher_test_${Date.now()}@test.com`,
        phone: `011${Date.now().toString().slice(-8)}`,
        passwordHash: tHash,
        role: UserRole.TEACHER,
        approved: true,
        approvalStatus: 'approved',
      });
      teacherId = teacher._id.toString();
      teacherToken = generateAccessToken({ userId: teacherId, role: UserRole.TEACHER });
    } else {
      teacherId = '507f1f77bcf86cd799439011';
      teacherToken = generateAccessToken({ userId: teacherId, role: UserRole.TEACHER });
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1 && testUserId) {
      try {
        await User.findByIdAndDelete(testUserId);
      } catch (_err) {}
    }
  });

  it('1. Public visitor can view public lesson 1 (preview) but lesson 2 is locked', async () => {
    const resLesson1 = await request.get('/api/v1/lessons');
    expect(resLesson1.status).toBe(200);
    expect(resLesson1.body.data[0].isUnlocked).toBe(true);

    const resLesson2 = await request.get('/api/v1/lessons/lesson-2');
    expect(resLesson2.status).toBe(403);
    expect(resLesson2.body.code).toBe('LESSON_LOCKED');
  });

  it('2. New user registration defaults to pending approval status', async () => {
    const timestamp = Date.now();
    const regRes = await request.post('/api/v1/auth/register').send({
      name: 'طالب جديد للاختبار',
      phone: `012${timestamp.toString().slice(-8)}`,
      password: 'StudentPass123!',
      confirmPassword: 'StudentPass123!',
      acceptTerms: true,
      role: 'student',
    });

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.data.user.approved).toBe(false);
    expect(regRes.body.data.user.approvalStatus).toBe('pending');

    testUserId = regRes.body.data.user.id;
    testUserToken = regRes.body.data.accessToken;
  });

  it('3. Pending user attempting to open locked lesson 2 receives 403 ACCOUNT_PENDING_APPROVAL', async () => {
    const res = await request
      .get('/api/v1/lessons/lesson-2')
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ACCOUNT_PENDING_APPROVAL');
    expect(res.body.message).toContain('Your account is awaiting teacher approval');
  });

  it('4. Teacher can list all users and view their approval statuses', async () => {
    const res = await request
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const targetUser = res.body.data.find((u: any) => u.id === testUserId);
    expect(targetUser).toBeDefined();
    expect(targetUser.approvalStatus).toBe('pending');
    expect(targetUser.approved).toBe(false);
  });

  it('5. Teacher can approve user with 1 click', async () => {
    const res = await request
      .patch(`/api/v1/admin/users/${testUserId}/approval`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ status: 'approved' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.approved).toBe(true);
    expect(res.body.data.approvalStatus).toBe('approved');
  });

  it('6. Approved user can now open lesson 2 successfully (200 OK)', async () => {
    const res = await request
      .get('/api/v1/lessons/lesson-2')
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order).toBe(2);
    expect(res.body.data.isUnlocked).toBe(true);
  });

  it('7. Teacher can revoke or reject user access with 1 click', async () => {
    const res = await request
      .patch(`/api/v1/admin/users/${testUserId}/approval`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ status: 'rejected' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.approved).toBe(false);
    expect(res.body.data.approvalStatus).toBe('rejected');
  });

  it('8. Revoked user is immediately locked out from lesson 2 with 403 ACCOUNT_REJECTED', async () => {
    const res = await request
      .get('/api/v1/lessons/lesson-2')
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ACCOUNT_REJECTED');
  });
});
