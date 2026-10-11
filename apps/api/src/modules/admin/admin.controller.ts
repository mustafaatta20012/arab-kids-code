import { Response } from 'express';
import { AdminService } from './admin.service';
import { AuthenticatedRequest } from '../../middleware/auth';
import { ReviewStatus, SubscriptionStatus } from '@arab-kids-code/shared';
import { z } from 'zod';

const CreateFamilySchema = z.object({
  parentName: z.string().min(2, 'اسم ولي الأمر مطلوب'),
  parentPhone: z.string().min(8, 'رقم الهاتف مطلوب'),
  parentPassword: z.string().optional(),
  children: z.array(
    z.object({
      displayName: z.string().min(2, 'اسم الطفل مطلوب'),
      birthYear: z.number().min(2005).max(2022),
      username: z.string().optional(),
    }),
  ),
});

const UpdateSubscriptionSchema = z.object({
  status: z.nativeEnum(SubscriptionStatus),
  unlockedUpTo: z.number().min(1).max(30).default(30),
});

const ModerateReviewSchema = z.object({
  status: z.nativeEnum(ReviewStatus),
});

const GradeSubmissionSchema = z.object({
  teacherFeedback: z.string().min(2, 'ملاحظات المعلم مطلوبة'),
  rating: z.number().min(1).max(5),
});

export class AdminController {
  static async getAnalytics(_req: AuthenticatedRequest, res: Response) {
    const data = await AdminService.getAnalytics();
    res.status(200).json({
      success: true,
      message: 'تحليلات المنصة للمعلم',
      data,
    });
  }

  static async listStudents(req: AuthenticatedRequest, res: Response) {
    const query = (req.query.q as string) || '';
    const students = await AdminService.listStudents(query);
    res.status(200).json({
      success: true,
      message: 'قائمة الطلاب والعائلات',
      data: students,
    });
  }

  static async createFamily(req: AuthenticatedRequest, res: Response) {
    try {
      const actorId = req.user!.userId;
      const input = CreateFamilySchema.parse(req.body);
      const result = await AdminService.createFamily(input, actorId);
      res.status(201).json({
        success: true,
        message: 'تم إضافة العائلة والطفل بنجاح',
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        code: 'CREATE_FAMILY_ERROR',
        message: err.message || 'فشل إضافة العائلة',
        details: err.errors,
      });
    }
  }

  static async updateSubscription(req: AuthenticatedRequest, res: Response) {
    try {
      const studentId = req.params.studentId as string;
      const actorId = req.user!.userId;
      const { status, unlockedUpTo } = UpdateSubscriptionSchema.parse(req.body);

      const sub = await AdminService.updateSubscription(studentId, status, unlockedUpTo, actorId);
      res.status(200).json({
        success: true,
        message: 'تم تحديث حالة الاشتراك بنجاح',
        data: sub,
      });
    } catch (err: any) {
      res.status(err.status || 400).json({
        success: false,
        code: 'SUBSCRIPTION_UPDATE_ERROR',
        message: err.message || 'فشل تحديث الاشتراك',
      });
    }
  }

  static async getPendingReviews(_req: AuthenticatedRequest, res: Response) {
    const reviews = await AdminService.getPendingReviews();
    res.status(200).json({
      success: true,
      message: 'طابور مراجعة التقييمات المعلقة',
      data: reviews,
    });
  }

  static async moderateReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const actorId = req.user!.userId;
      const { status } = ModerateReviewSchema.parse(req.body);

      const review = await AdminService.moderateReview(id as string, status, actorId);
      res.status(200).json({
        success: true,
        message: 'تم مراجعة التقييم',
        data: review,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        code: 'MODERATE_REVIEW_ERROR',
        message: err.message || 'فشل مراجعة التقييم',
      });
    }
  }

  static async getPendingSubmissions(_req: AuthenticatedRequest, res: Response) {
    const submissions = await AdminService.getPendingSubmissions();
    res.status(200).json({
      success: true,
      message: 'طابور مراجعة مشروعات سكراتش المعلقة',
      data: submissions,
    });
  }

  static async gradeSubmission(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const actorId = req.user!.userId;
      const { teacherFeedback, rating } = GradeSubmissionSchema.parse(req.body);

      const sub = await AdminService.gradeSubmission(id as string, teacherFeedback, rating, actorId);
      res.status(200).json({
        success: true,
        message: 'تم تقييم مشروع الطالب بنجاح وإرسال النجمات!',
        data: sub,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        code: 'GRADE_SUBMISSION_ERROR',
        message: err.message || 'فشل تقييم المشروع',
      });
    }
  }

  static async getAuditLogs(_req: AuthenticatedRequest, res: Response) {
    const logs = await AdminService.getAuditLogs();
    res.status(200).json({
      success: true,
      message: 'سجل تدقيق إجراءات الإدارة',
      data: logs,
    });
  }

  static async exportStudentsCsv(_req: AuthenticatedRequest, res: Response) {
    const csvContent = await AdminService.exportStudentsCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="students_report.csv"');
    res.status(200).send('\uFEFF' + csvContent); // Include UTF-8 BOM for Excel Arabic support
  }

  static async listUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const query = (req.query.q as string) || '';
      const statusFilter = (req.query.status as string) || '';
      const users = await AdminService.listUsers(query, statusFilter);
      res.status(200).json({
        success: true,
        message: 'قائمة المستخدمين وحالات الاعتماد',
        data: users,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        code: 'LIST_USERS_ERROR',
        message: err.message || 'فشل جلب قائمة المستخدمين',
      });
    }
  }

  static async updateUserApproval(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const actorId = req.user!.userId;
      const { status, subscriptionStart, subscriptionEnd } = z.object({
        status: z.enum(['approved', 'rejected', 'pending']),
        subscriptionStart: z.string().optional(),
        subscriptionEnd: z.string().optional(),
      }).parse(req.body);

      const result = await AdminService.updateUserApproval(id as string, status, actorId, subscriptionStart, subscriptionEnd);
      res.status(200).json({
        success: true,
        message: 'تم تحديث حالة صلاحية المستخدم وتواريخ الاشتراك بنجاح',
        data: result,
      });
    } catch (err: any) {
      res.status(err.status || 400).json({
        success: false,
        code: err.code || 'UPDATE_APPROVAL_ERROR',
        message: err.message || 'فشل تحديث حالة الصلاحية',
        details: err.errors,
      });
    }
  }

  static async renewSubscription(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const actorId = req.user!.userId;
      const { newEndDate } = z.object({
        newEndDate: z.string().min(1, 'تاريخ الانتهاء الجديد مطلوب'),
      }).parse(req.body);

      const result = await AdminService.renewSubscription(id as string, newEndDate, actorId);
      res.status(200).json({
        success: true,
        message: 'تم تجديد الاشتراك بنجاح وتحديث تاريخ الانتهاء',
        data: result,
      });
    } catch (err: any) {
      res.status(err.status || 400).json({
        success: false,
        code: 'RENEW_SUBSCRIPTION_ERROR',
        message: err.message || 'فشل تجديد الاشتراك',
      });
    }
  }

  static async revokeSubscription(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const actorId = req.user!.userId;
      const result = await AdminService.revokeSubscription(id as string, actorId);
      res.status(200).json({
        success: true,
        message: 'تم إلغاء وسحب الاشتراك وقفل الدروس فوراً',
        data: result,
      });
    } catch (err: any) {
      res.status(err.status || 400).json({
        success: false,
        code: 'REVOKE_SUBSCRIPTION_ERROR',
        message: err.message || 'فشل سحب الاشتراك',
      });
    }
  }
}

