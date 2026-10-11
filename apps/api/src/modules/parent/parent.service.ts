import bcrypt from 'bcryptjs';
import { Parent, Student, User, Progress, Subscription } from '../../models';

import { SubscriptionStatus, UserRole } from '@arab-kids-code/shared';

export class ParentService {
  /**
   * Fetch parent profile and all linked children with full progress stats.
   */
  static async getMyChildren(userId: string) {
    const parent = await Parent.findOne({ userId }).populate({
      path: 'children',
      populate: { path: 'userId', select: 'name username status' },
    });

    if (!parent) {
      throw { status: 404, code: 'PARENT_NOT_FOUND', message: 'ملف ولي الأمر غير موجود' };
    }

    const childrenStats = await Promise.all(
      parent.children.map(async (child: any) => {
        const studentId = child._id;

        // Completed lessons count
        const completedLessonsCount = await Progress.countDocuments({
          studentId,
          status: 'completed',
        });

        // Active subscription info
        const subscription = await Subscription.findOne({
          studentId,
          status: SubscriptionStatus.ACTIVE,
        });

        const totalLessonsCount = 30;
        const progressPercentage = Math.round((completedLessonsCount / totalLessonsCount) * 100);

        return {
          id: studentId.toString(),
          displayName: child.displayName,
          birthYear: child.birthYear,
          avatar: child.avatar,
          level: child.level,
          xp: child.xp,
          streakDays: child.streakDays,
          badges: child.badges || [],
          progress: {
            completedLessonsCount,
            totalLessonsCount,
            percentage: progressPercentage,
          },
          subscription: subscription
            ? {
                status: subscription.status,
                plan: subscription.plan,
                unlockedUpTo: subscription.unlockedUpTo,
                startsAt: subscription.startsAt,
              }
            : null,
        };
      }),
    );

    return {
      parent: {
        id: parent._id.toString(),
        phone: parent.phone,
        whatsapp: parent.whatsapp,
      },
      children: childrenStats,
    };
  }

  /**
   * Add a new child profile linked to current parent.
   */
  static async addChild(userId: string, input: { displayName: string; birthYear: number; avatar?: string; username?: string; password?: string }) {
    const parent = await Parent.findOne({ userId });
    if (!parent) {
      throw { status: 404, code: 'PARENT_NOT_FOUND', message: 'ملف ولي الأمر غير موجود' };
    }

    const childUsername = input.username || `student_${Date.now().toString().slice(-6)}`;
    const childPassword = input.password || '123456';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(childPassword, salt);

    // Create student user account
    const studentUser = await User.create({
      name: input.displayName,
      username: childUsername.toLowerCase(),
      passwordHash,
      role: UserRole.STUDENT,
      status: 'active',
    });

    // Create student profile
    const studentProfile = await Student.create({
      userId: studentUser._id,
      parentId: parent._id,
      displayName: input.displayName,
      birthYear: input.birthYear,
      avatar: input.avatar || 'avatar_robot_blue.png',
      level: 1,
      xp: 0,
      streakDays: 0,
      badges: [],
    });

    // Add student to parent's children array
    parent.children.push(studentProfile._id as any);
    await parent.save();

    return {
      child: {
        id: studentProfile._id.toString(),
        displayName: studentProfile.displayName,
        username: studentUser.username,
        birthYear: studentProfile.birthYear,
        avatar: studentProfile.avatar,
        level: studentProfile.level,
        xp: studentProfile.xp,
      },
    };
  }
}
