import { Response } from 'express';
import { LessonService } from './lesson.service';
import { AuthenticatedRequest } from '../../middleware/auth';
import { ProgressUpdateSchema, QuizSubmissionSchema, ProjectSubmissionSchema } from '@arab-kids-code/shared';

export class LessonController {
  static async listLessons(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;

      const lessons = await LessonService.listLessons(userId, role);
      res.status(200).json({
        success: true,
        message: 'قائمة الدروس',
        data: lessons,
      });
    } catch (err: any) {
      console.error('LIST_LESSONS_ERROR:', err);
      res.status(err.status || 500).json({
        success: false,
        code: err.code || 'LIST_LESSONS_ERROR',
        message: err.message || 'فشل جلب الدروس',
      });
    }
  }

  static async getLessonById(req: AuthenticatedRequest, res: Response) {
    try {
      const lessonId = req.params.id as string;
      const userId = req.user?.userId;
      const role = req.user?.role;

      const lesson = await LessonService.getLessonById(lessonId, userId, role);
      res.status(200).json({
        success: true,
        message: 'تفاصيل الدرس',
        data: lesson,
      });
    } catch (err: any) {
      res.status(err.status || 403).json({
        success: false,
        code: err.code || 'LESSON_ACCESS_ERROR',
        message: err.message || 'فشل فتح الدرس',
      });
    }
  }

  static async updateProgress(req: AuthenticatedRequest, res: Response) {
    try {
      const lessonId = req.params.id as string;
      const userId = req.user!.userId;
      const role = req.user!.role;
      const input = ProgressUpdateSchema.parse(req.body);

      const result = await LessonService.updateProgress(userId, role, lessonId, input);
      res.status(200).json({
        success: true,
        message: 'تم تحديث تقدم الطالب بنجاح',
        data: result,
      });
    } catch (err: any) {
      res.status(err.status || 400).json({
        success: false,
        code: err.code || 'PROGRESS_UPDATE_ERROR',
        message: err.message || 'فشل تحديث التقدم',
        details: err.errors,
      });
    }
  }

  static async submitQuiz(req: AuthenticatedRequest, res: Response) {
    try {
      const lessonId = req.params.id as string;
      const userId = req.user!.userId;
      const role = req.user!.role;
      const input = QuizSubmissionSchema.parse(req.body);

      const result = await LessonService.submitQuiz(userId, role, lessonId, input);
      res.status(200).json({
        success: true,
        message: 'تم تصحيح الاختبار بنجاح',
        data: result,
      });
    } catch (err: any) {
      res.status(err.status || 400).json({
        success: false,
        code: err.code || 'QUIZ_SUBMIT_ERROR',
        message: err.message || 'فشل إرسال الاختبار',
        details: err.errors,
      });
    }
  }

  static async submitProject(req: AuthenticatedRequest, res: Response) {
    try {
      const lessonId = req.params.id as string;
      const userId = req.user!.userId;
      const role = req.user!.role;
      const input = ProjectSubmissionSchema.parse(req.body);

      const result = await LessonService.submitProject(userId, role, lessonId, input);
      res.status(201).json({
        success: true,
        message: 'تم إرسال مشروع سكراتش للمدرس بنجاح!',
        data: result,
      });
    } catch (err: any) {
      res.status(err.status || 400).json({
        success: false,
        code: err.code || 'PROJECT_SUBMIT_ERROR',
        message: err.message || 'فشل إرسال المشروع',
        details: err.errors,
      });
    }
  }

  static async getMySubmissions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const submissions = await LessonService.getStudentSubmissions(userId);
      res.status(200).json({
        success: true,
        message: 'مشروعاتي المرسلة للمعلم',
        data: submissions,
      });
    } catch (_err: any) {
      res.status(500).json({
        success: false,
        code: 'SUBMISSIONS_ERROR',
        message: 'فشل جلب المشروعات',
      });
    }
  }
}
