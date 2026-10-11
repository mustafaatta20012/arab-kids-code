import mongoose from 'mongoose';
import { User, Lesson, Progress, Quiz, Submission, Student } from '../../models';
import { generateSignedVideoUrl } from '../../utils/media';

import { updateStreak, awardXpAndBadges } from '../../utils/gamification';
import { LessonProgressStatus, UserRole } from '@arab-kids-code/shared';
import { ProgressUpdateInput, QuizSubmissionInput, ProjectSubmissionInput } from '@arab-kids-code/shared';

export class LessonService {
  /**
   * Server-side authorization check to determine if a specific lesson order is unlocked for a user.
   */
  static async checkIsLessonUnlocked(
    userId?: string,
    role?: UserRole,
    lessonOrder: number = 1,
  ): Promise<boolean> {
    // Lesson 1 is always free for everyone as preview
    if (lessonOrder === 1) {
      return true;
    }

    // Unauthenticated visitors cannot access locked lessons (> 1)
    if (!userId || !role || role === UserRole.VISITOR) {
      return false;
    }

    // Teacher and Super Admin have unrestricted full access
    if (role === UserRole.TEACHER || role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Access control check: Query user approval status
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findById(userId);
        if (!user) return false;

        // Teacher role is always unlocked
        if (user.role === UserRole.TEACHER || user.role === UserRole.SUPER_ADMIN) {
          return true;
        }

        // Access control: Only teacher-approved accounts can access lessons
        if (!user.approved || user.approvalStatus !== 'approved') {
          return false;
        }

        // Subscription expiry check on backend
        if (user.subscriptionEnd) {
          const now = new Date();
          if (new Date(user.subscriptionEnd) < now) {
            return false; // Expired, automatically locked
          }
        }

        return true;
      } catch (_err) {
        return false;
      }
    }

    return false;
  }

  /**
   * Retrieve all lessons with server-evaluated `isUnlocked` status.
   */
  static async listLessons(userId?: string, role?: UserRole) {
    let lessons = [];
    if (mongoose.connection.readyState === 1) {
      try {
        lessons = await Lesson.find({ isPublished: true }).sort({ order: 1 });
      } catch (_err) {
        lessons = [];
      }
    }

    // Default mock list if DB is empty or disconnected
    if (!lessons.length) {
      lessons = Array.from({ length: 30 }, (_, idx) => {
        const order = idx + 1;
        return {
          _id: `mock_lesson_${order}`,
          order,
          slug: `lesson-${order}`,
          title: { ar: `الدرس ${order}`, en: `Lesson ${order}` },
          summary: { ar: `شرح الدرس ${order}`, en: `Summary ${order}` },
          isFree: order === 1,
          durationMin: 15,
          xpReward: 50,
          videoAssetId: `video_${order}`,
          videoUrl: order === 1 ? '/images/النظام_الثنائي.mp4' : undefined,
          scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
          isPublished: true,
        } as any;
      });
    }

    const result = await Promise.all(
      lessons.map(async (lesson) => {
        const isUnlocked = await this.checkIsLessonUnlocked(userId, role, lesson.order);

        return {
          id: lesson._id ? String(lesson._id) : `lesson_${lesson.order}`,
          order: lesson.order,
          slug: lesson.slug,
          title: lesson.title,
          summary: lesson.summary,
          isFree: lesson.isFree,
          isUnlocked,
          durationMin: lesson.durationMin,
          xpReward: lesson.xpReward,
          // Redact protected media if locked
          videoUrl: isUnlocked ? (lesson.videoAssetId ? generateSignedVideoUrl(lesson.videoAssetId, lesson.videoUrl) : lesson.videoUrl) : undefined,
          scratchProjectUrl: isUnlocked ? lesson.scratchProjectUrl : undefined,
        };

      }),
    );

    return result;
  }


  /**
   * Get single lesson details with strict server-side unlock enforcement.
   */
  static async getLessonById(lessonId: string, userId?: string, role?: UserRole) {
    let lesson: any = null;

    if (mongoose.connection.readyState === 1 && lessonId.length === 24) {
      try {
        lesson = await Lesson.findById(lessonId).populate('quizId');
      } catch (_err) {
        lesson = null;
      }
    }

    // Mock fallback if DB is disconnected or mock ID passed
    if (!lesson) {
      const order = lessonId.includes('2') ? 2 : 1;
      lesson = {
        _id: lessonId,
        order,
        slug: `lesson-${order}`,
        title: { ar: `الدرس ${order}`, en: `Lesson ${order}` },
        summary: { ar: `شرح تفصيلي للدرس ${order}`, en: `Lesson ${order} Summary` },
        isFree: order === 1,
        isPublished: true,
        durationMin: 15,
        xpReward: 50,
        videoAssetId: `video_${order}`,
        videoUrl: '/images/النظام_الثنائي.mp4',
        scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
        resources: [],
      };
    }

    // Server-side lock and approval enforcement for lesson access
    if (lesson.order > 1) {
      if (!userId) {
        throw {
          status: 403,
          code: 'LESSON_LOCKED',
          message: 'هذا الدرس مغلق. يرجى تسجيل الدخول والاشتراك لفتحه.',
        };
      }

      // Check user approval and subscription status in database
      if (mongoose.connection.readyState === 1) {
        const user = await User.findById(userId);
        if (user && user.role !== UserRole.TEACHER && user.role !== UserRole.SUPER_ADMIN) {
          if (!user.approved || user.approvalStatus !== 'approved') {
            const isRejected = user.approvalStatus === 'rejected';
            throw {
              status: 403,
              code: isRejected ? 'ACCOUNT_REJECTED' : 'ACCOUNT_PENDING_APPROVAL',
              message: isRejected
                ? 'تم رفض وصول حسابك من قبل المعلم. يرجى التواصل مع إدارة المنصة.'
                : 'حسابك قيد مراجعة المعلم حالياً (Your account is awaiting teacher approval)',
            };
          }

          // Check if subscription expired
          if (user.subscriptionEnd) {
            const now = new Date();
            if (new Date(user.subscriptionEnd) < now) {
              throw {
                status: 403,
                code: 'SUBSCRIPTION_EXPIRED',
                message: 'انتهت فترة اشتراكك. يُرجى التواصل مع المعلم لتجديد الاشتراك.',
              };
            }
          }
        }
      }
    }

    const isUnlocked = await this.checkIsLessonUnlocked(userId, role, lesson.order);
    if (!isUnlocked) {
      throw {
        status: 403,
        code: 'LESSON_LOCKED',
        message: 'هذا الدرس مغلق. يرجى انتظار موافقة المعلم لتفعيل الحساب.',
      };
    }


    // Generate signed video URL for unlocked lesson
    const signedVideoUrl = lesson.videoAssetId
      ? generateSignedVideoUrl(lesson.videoAssetId, lesson.videoUrl)
      : lesson.videoUrl;

    return {
      id: lesson._id.toString(),
      order: lesson.order,
      slug: lesson.slug,
      title: lesson.title,
      summary: lesson.summary,
      isFree: lesson.isFree,
      isUnlocked: true,
      durationMin: lesson.durationMin,
      xpReward: lesson.xpReward,
      videoUrl: signedVideoUrl,
      scratchProjectUrl: lesson.scratchProjectUrl,
      resources: lesson.resources,
      quiz: lesson.quizId,
    };
  }

  /**
   * Update student watch progress and handle gamification (XP, Level, Streak, Badges).
   */
  static async updateProgress(userId: string, role: UserRole, lessonId: string, input: ProgressUpdateInput) {
    if (role !== UserRole.STUDENT) {
      throw { status: 403, code: 'STUDENTS_ONLY', message: 'تتبع التقدم متاح فقط لحسابات الطلاب' };
    }

    const student = await Student.findOne({ userId });
    if (!student) {
      throw { status: 404, code: 'STUDENT_NOT_FOUND', message: 'ملف الطالب غير موجود' };
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw { status: 404, code: 'LESSON_NOT_FOUND', message: 'الدرس غير موجود' };
    }

    const isUnlocked = await this.checkIsLessonUnlocked(userId, role, lesson.order);
    if (!isUnlocked) {
      throw { status: 403, code: 'LESSON_LOCKED', message: 'لا يمكن تسجيل التقدم لدرس مغلق' };
    }

    let progress = await Progress.findOne({ studentId: student._id, lessonId: lesson._id });
    const isFirstTimeCompletion = input.isCompleted && (!progress || progress.status !== LessonProgressStatus.COMPLETED);

    if (!progress) {
      progress = new Progress({
        studentId: student._id,
        lessonId: lesson._id,
        watchedSeconds: input.watchedSeconds,
        status: input.isCompleted ? LessonProgressStatus.COMPLETED : LessonProgressStatus.IN_PROGRESS,
      });
    } else {
      progress.watchedSeconds = Math.max(progress.watchedSeconds, input.watchedSeconds);
      if (input.isCompleted) {
        progress.status = LessonProgressStatus.COMPLETED;
        progress.completedAt = new Date();
      }
    }
    await progress.save();

    // Gamification Rewards on first completion
    let rewardResult = null;
    if (isFirstTimeCompletion) {
      updateStreak(student);
      rewardResult = await awardXpAndBadges(student, lesson.xpReward, 'lesson_complete');
    }

    return {
      progress: {
        lessonId: lesson._id.toString(),
        status: progress.status,
        watchedSeconds: progress.watchedSeconds,
        completedAt: progress.completedAt,
      },
      rewards: rewardResult,
    };
  }

  /**
   * Submit quiz answers and calculate score & bonus XP.
   */
  static async submitQuiz(userId: string, role: UserRole, lessonId: string, input: QuizSubmissionInput) {
    const student = await Student.findOne({ userId });
    if (!student && role === UserRole.STUDENT) {
      throw { status: 404, code: 'STUDENT_NOT_FOUND', message: 'ملف الطالب غير موجود' };
    }

    const quiz = await Quiz.findOne({ lessonId });
    if (!quiz) {
      throw { status: 404, code: 'QUIZ_NOT_FOUND', message: 'لا يوجد اختبار لهذا الدرس' };
    }

    let correctAnswersCount = 0;
    const totalQuestions = quiz.questions.length;
    const evaluatedQuestions = quiz.questions.map((q, idx) => {
      const userSubmission = input.answers.find((a: any) => a.questionIndex === idx);
      const isCorrect = userSubmission ? userSubmission.selectedOption === q.correctIndex : false;
      if (isCorrect) correctAnswersCount++;

      return {
        questionIndex: idx,
        questionText: q.text,
        userOption: userSubmission?.selectedOption,
        correctOption: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const scorePercentage = Math.round((correctAnswersCount / totalQuestions) * 100);
    const passed = scorePercentage >= 70;

    let rewards = null;
    if (passed && student) {
      updateStreak(student);
      rewards = await awardXpAndBadges(student, 30, 'quiz_pass'); // 30 Bonus XP for passing quiz
    }

    return {
      scorePercentage,
      passed,
      correctAnswersCount,
      totalQuestions,
      results: evaluatedQuestions,
      rewards,
    };
  }

  /**
   * Submit Scratch project exercise link.
   */
  static async submitProject(userId: string, role: UserRole, lessonId: string, input: ProjectSubmissionInput) {
    if (role !== UserRole.STUDENT) {
      throw { status: 403, code: 'STUDENTS_ONLY', message: 'إرسال المشروعات متاح للطلاب فقط' };
    }

    const student = await Student.findOne({ userId });
    if (!student) {
      throw { status: 404, code: 'STUDENT_NOT_FOUND', message: 'ملف الطالب غير موجود' };
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw { status: 404, code: 'LESSON_NOT_FOUND', message: 'الدرس غير موجود' };
    }

    const submission = await Submission.create({
      studentId: student._id,
      lessonId: lesson._id,
      scratchLink: input.scratchLink,
      fileAssetId: input.fileAssetId,
      status: 'pending',
    });

    // Award XP for project submission
    updateStreak(student);
    const rewards = await awardXpAndBadges(student, 40, 'project_submit');

    return {
      submission: {
        id: submission._id.toString(),
        lessonId: lesson._id.toString(),
        scratchLink: submission.scratchLink,
        status: submission.status,
        createdAt: submission.createdAt,
      },
      rewards,
    };
  }

  /**
   * Get list of student's project submissions with teacher feedback.
   */
  static async getStudentSubmissions(userId: string) {
    const student = await Student.findOne({ userId });
    if (!student) return [];

    const submissions = await Submission.find({ studentId: student._id })
      .populate('lessonId', 'order title slug')
      .sort({ createdAt: -1 });

    return submissions;
  }
}
