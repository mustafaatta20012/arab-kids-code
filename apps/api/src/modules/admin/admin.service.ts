import bcrypt from 'bcryptjs';
import { User, Parent, Student, Subscription, Progress, Review, Submission, AuditLog } from '../../models';
import { ReviewStatus, SubscriptionStatus, UserRole } from '@arab-kids-code/shared';

export class AdminService {
  /**
   * Get high-level platform analytics overview.
   */
  static async getAnalytics() {
    const totalStudents = await Student.countDocuments();
    const totalParents = await Parent.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: SubscriptionStatus.ACTIVE });
    const pendingReviewsCount = await Review.countDocuments({ status: ReviewStatus.PENDING });
    const pendingSubmissionsCount = await Submission.countDocuments({ status: 'pending' });

    // Lesson drop-off calculation (completion count per lesson)
    const progressStats = await Progress.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$lessonId', completions: { $sum: 1 } } },
      { $sort: { completions: -1 } },
      { $limit: 10 },
    ]);

    return {
      overview: {
        totalStudents,
        totalParents,
        activeSubscriptions,
        pendingReviewsCount,
        pendingSubmissionsCount,
      },
      progressStats,
    };
  }

  /**
   * List students with parent details and subscription info.
   */
  static async listStudents(query: string = '') {
    const filter: any = {};
    if (query) {
      filter.displayName = { $regex: query, $options: 'i' };
    }

    const students = await Student.find(filter)
      .populate('userId', 'username status lastLoginAt')
      .populate({
        path: 'parentId',
        populate: { path: 'userId', select: 'name phone email' },
      })
      .sort({ createdAt: -1 });

    const now = new Date();
    const result = await Promise.all(
      students.map(async (st: any) => {
        const activeSub = await Subscription.findOne({
          studentId: st._id,
          status: SubscriptionStatus.ACTIVE,
        });

        const completedCount = await Progress.countDocuments({
          studentId: st._id,
          status: 'completed',
        });

        const subEnd = st.userId?.subscriptionEnd || st.subscriptionEnd || activeSub?.endsAt;
        const subStart = st.userId?.subscriptionStart || st.subscriptionStart || activeSub?.startsAt;

        let subStatusBadge: 'active' | 'expiring_soon' | 'expired' | 'none' = 'none';
        if (subEnd) {
          const end = new Date(subEnd);
          const diffMs = end.getTime() - now.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          if (diffMs <= 0) {
            subStatusBadge = 'expired';
          } else if (diffDays <= 2) {
            subStatusBadge = 'expiring_soon';
          } else {
            subStatusBadge = 'active';
          }
        } else if (st.userId?.approved || activeSub) {
          subStatusBadge = 'active';
        }

        return {
          id: st._id.toString(),
          userId: st.userId?._id?.toString() || st.userId?.id,
          displayName: st.displayName,
          birthYear: st.birthYear,
          avatar: st.avatar,
          level: st.level,
          xp: st.xp,
          streakDays: st.streakDays,
          badges: st.badges,
          username: st.userId?.username,
          parentName: st.parentId?.userId?.name || 'غير محدد',
          parentPhone: st.parentId?.phone || st.parentId?.userId?.phone,
          completedLessons: completedCount,
          subscriptionStart: subStart,
          subscriptionEnd: subEnd,
          subscriptionStatusBadge: subStatusBadge,
          subscription: activeSub
            ? {
                id: activeSub._id.toString(),
                status: activeSub.status,
                unlockedUpTo: activeSub.unlockedUpTo,
                endsAt: activeSub.endsAt,
              }
            : null,
        };
      }),
    );

    return result;
  }

  /**
   * Create a new Family account (Parent + linked Children).
   */
  static async createFamily(input: { parentName: string; parentPhone: string; parentPassword?: string; children: Array<{ displayName: string; birthYear: number; username?: string }> }, actorId: string) {
    const parentPassword = input.parentPassword || 'ParentPass123!';
    const parentSalt = await bcrypt.genSalt(10);
    const parentHash = await bcrypt.hash(parentPassword, parentSalt);

    // 1. Create Parent User
    const parentUser = await User.create({
      name: input.parentName,
      phone: input.parentPhone,
      passwordHash: parentHash,
      role: UserRole.PARENT,
      status: 'active',
    });

    const parentProfile = await Parent.create({
      userId: parentUser._id,
      phone: input.parentPhone,
      children: [],
    });

    // 2. Create Children
    const createdChildren = [];
    for (const childInput of input.children) {
      const childUsername = childInput.username || `student_${Date.now().toString().slice(-5)}`;
      const childSalt = await bcrypt.genSalt(10);
      const childHash = await bcrypt.hash('123456', childSalt);

      const studentUser = await User.create({
        name: childInput.displayName,
        username: childUsername.toLowerCase(),
        passwordHash: childHash,
        role: UserRole.STUDENT,
        status: 'active',
      });

      const studentProfile = await Student.create({
        userId: studentUser._id,
        parentId: parentProfile._id,
        displayName: childInput.displayName,
        birthYear: childInput.birthYear,
        avatar: 'avatar_robot_blue.png',
        level: 1,
        xp: 0,
      });

      parentProfile.children.push(studentProfile._id as any);
      createdChildren.push({
        id: studentProfile._id.toString(),
        displayName: studentProfile.displayName,
        username: studentUser.username,
      });
    }
    await parentProfile.save();

    // Log administrative action
    await AuditLog.create({
      actorId,
      action: 'create_family',
      entity: 'Parent',
      entityId: parentProfile._id.toString(),
      diff: { parentName: input.parentName, childrenCount: input.children.length },
    });

    return {
      parent: {
        id: parentProfile._id.toString(),
        name: parentUser.name,
        phone: parentUser.phone,
      },
      children: createdChildren,
    };
  }

  /**
   * Activate or modify subscription status for a student.
   */
  static async updateSubscription(studentId: string, status: SubscriptionStatus, unlockedUpTo: number = 30, actorId: string) {
    const student = await Student.findById(studentId);
    if (!student) {
      throw { status: 404, code: 'STUDENT_NOT_FOUND', message: 'الطالب غير موجود' };
    }

    let sub = await Subscription.findOne({ studentId: student._id });
    if (!sub) {
      sub = new Subscription({
        studentId: student._id,
        parentId: student.parentId,
        plan: 'full_course_access',
        status,
        unlockedUpTo,
        startsAt: new Date(),
      });
    } else {
      sub.status = status;
      sub.unlockedUpTo = unlockedUpTo;
    }
    await sub.save();

    // Audit log
    await AuditLog.create({
      actorId,
      action: 'update_subscription',
      entity: 'Subscription',
      entityId: sub._id.toString(),
      diff: { studentId, status, unlockedUpTo },
    });

    return sub;
  }

  /**
   * Get pending reviews moderation queue.
   */
  static async getPendingReviews() {
    return await Review.find({ status: ReviewStatus.PENDING }).sort({ createdAt: -1 });
  }

  /**
   * Approve or reject a review.
   */
  static async moderateReview(reviewId: string, status: ReviewStatus, actorId: string) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw { status: 404, code: 'REVIEW_NOT_FOUND', message: 'التقييم غير موجود' };
    }

    review.status = status;
    review.moderatedBy = actorId as any;
    review.moderatedAt = new Date();
    await review.save();

    return review;
  }

  /**
   * Get pending Scratch project submissions queue.
   */
  static async getPendingSubmissions() {
    return await Submission.find({ status: 'pending' })
      .populate('studentId', 'displayName level avatar')
      .populate('lessonId', 'order title')
      .sort({ createdAt: -1 });
  }

  /**
   * Grade a Scratch project submission with teacher feedback and rating.
   */
  static async gradeSubmission(submissionId: string, teacherFeedback: string, rating: number, actorId: string) {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      throw { status: 404, code: 'SUBMISSION_NOT_FOUND', message: 'المشروع غير موجود' };
    }

    submission.status = 'reviewed';
    submission.teacherFeedback = teacherFeedback;
    submission.rating = rating;
    submission.reviewedBy = actorId as any;
    submission.reviewedAt = new Date();
    await submission.save();

    return submission;
  }

  /**
   * Get audit logs.
   */
  static async getAuditLogs() {
    return await AuditLog.find().populate('actorId', 'name email role').sort({ createdAt: -1 }).limit(100);
  }

  /**
   * Generate CSV format for exporting students list.
   */
  static async exportStudentsCsv() {
    const students = await this.listStudents();
    const header = 'ID,اسم الطالب,اسم ولي الأمر,رقم الهاتف,المستوى,XP,الدروس المكتملة,حالة الاشتراك\n';
    const rows = students
      .map(
        (s) =>
          `"${s.id}","${s.displayName}","${s.parentName}","${s.parentPhone || ''}",${s.level},${s.xp},${s.completedLessons},"${s.subscription ? 'مفعل' : 'غير مفعل'}"`,
      )
      .join('\n');

    return header + rows;
  }

  /**
   * List all platform users with their roles and access-control approval statuses.
   */
  static async listUsers(query: string = '', statusFilter: string = '') {
    const filter: any = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
      ];
    }

    if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
      filter.approvalStatus = statusFilter;
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    const now = new Date();

    return users.map((u) => {
      const isTeacherOrAdmin = u.role === UserRole.TEACHER || u.role === UserRole.SUPER_ADMIN;

      let subscriptionStatusBadge: 'active' | 'expiring_soon' | 'expired' | 'none' = 'none';
      if (isTeacherOrAdmin) {
        subscriptionStatusBadge = 'active';
      } else if (u.subscriptionEnd) {
        const end = new Date(u.subscriptionEnd);
        const diffMs = end.getTime() - now.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffMs <= 0) {
          subscriptionStatusBadge = 'expired';
        } else if (diffDays <= 2) {
          subscriptionStatusBadge = 'expiring_soon';
        } else {
          subscriptionStatusBadge = 'active';
        }
      } else if (u.approved) {
        subscriptionStatusBadge = 'active';
      }

      return {
        id: u._id.toString(),
        name: u.name,
        role: u.role,
        email: u.email,
        phone: u.phone,
        username: u.username,
        approved: isTeacherOrAdmin ? true : (u.approved ?? false),
        approvalStatus: isTeacherOrAdmin ? 'approved' : (u.approvalStatus ?? 'pending'),
        subscriptionStart: u.subscriptionStart,
        subscriptionEnd: u.subscriptionEnd,
        subscriptionStatusBadge,
        status: u.status,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
      };
    });
  }

  /**
   * One-click approval, rejection, or revocation of user access with subscription dates.
   */
  static async updateUserApproval(
    userId: string,
    status: 'approved' | 'rejected' | 'pending',
    actorId: string,
    subscriptionStart?: Date | string,
    subscriptionEnd?: Date | string,
  ) {
    const user = await User.findById(userId);
    if (!user) {
      throw { status: 404, code: 'USER_NOT_FOUND', message: 'المستخدم غير موجود' };
    }

    // Safeguard: Prevent teachers from revoking their own teacher account
    if (user._id.toString() === actorId && status !== 'approved') {
      throw { status: 400, code: 'CANNOT_REVOKE_SELF', message: 'لا يمكن للمعلم إلغاء اعتماد حسابه الشخصي' };
    }

    user.approvalStatus = status;
    user.approved = status === 'approved';

    const now = new Date();
    if (status === 'approved') {
      user.subscriptionStart = subscriptionStart ? new Date(subscriptionStart) : (user.subscriptionStart || now);
      if (subscriptionEnd) {
        user.subscriptionEnd = new Date(subscriptionEnd);
      } else if (!user.subscriptionEnd || new Date(user.subscriptionEnd) <= now) {
        // Default to 30 days from now
        user.subscriptionEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }
    } else if (status === 'rejected') {
      // Expire immediately
      user.subscriptionEnd = now;
    }

    await user.save();

    // Mirror to Student model if linked
    await Student.findOneAndUpdate(
      { userId: user._id },
      {
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
      },
    );

    // Update Subscription doc if exists
    const student = await Student.findOne({ userId: user._id });
    if (student) {
      await Subscription.findOneAndUpdate(
        { studentId: student._id },
        {
          status: status === 'approved' ? SubscriptionStatus.ACTIVE : SubscriptionStatus.CANCELLED,
          startsAt: user.subscriptionStart || now,
          endsAt: user.subscriptionEnd,
        },
      );
    }

    // Log administrative action
    await AuditLog.create({
      actorId,
      action: status === 'rejected' ? 'revoke_subscription' : 'update_user_approval',
      entity: 'User',
      entityId: user._id.toString(),
      diff: {
        approvalStatus: status,
        approved: user.approved,
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
        userName: user.name,
      },
    });

    return {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      approved: user.approved,
      approvalStatus: user.approvalStatus,
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
    };
  }

  /**
   * Renew subscription with a new end date.
   */
  static async renewSubscription(userId: string, newEndDate: string | Date, actorId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw { status: 404, code: 'USER_NOT_FOUND', message: 'المستخدم غير موجود' };
    }

    const end = new Date(newEndDate);
    user.subscriptionEnd = end;
    user.approved = true;
    user.approvalStatus = 'approved';
    if (!user.subscriptionStart) {
      user.subscriptionStart = new Date();
    }
    await user.save();

    const student = await Student.findOneAndUpdate(
      { userId: user._id },
      { subscriptionStart: user.subscriptionStart, subscriptionEnd: end },
    );

    if (student) {
      await Subscription.findOneAndUpdate(
        { studentId: student._id },
        { status: SubscriptionStatus.ACTIVE, endsAt: end },
        { upsert: true },
      );
    }

    await AuditLog.create({
      actorId,
      action: 'renew_subscription',
      entity: 'User',
      entityId: user._id.toString(),
      diff: { newEndDate: end, userName: user.name },
    });

    return {
      id: user._id.toString(),
      name: user.name,
      approved: user.approved,
      approvalStatus: user.approvalStatus,
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
    };
  }

  /**
   * Revoke subscription access immediately.
   */
  static async revokeSubscription(userId: string, actorId: string) {
    return await this.updateUserApproval(userId, 'rejected', actorId, undefined, new Date());
  }
}

