import { Request, Response } from 'express';
import { PublicService } from './public.service';
import { z } from 'zod';

const ReviewSubmitSchema = z.object({
  authorName: z.string().min(2, 'الاسم مطلوب'),
  authorType: z.enum(['parent', 'student']).default('parent'),
  rating: z.number().min(1).max(5),
  text: z.string().min(5, 'التعليق يجب أن يكون 5 أحرف على الأقل'),
});

const ContactSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  phone: z.string().min(8, 'رقم الهاتف مطلوب'),
  message: z.string().min(5, 'الرسالة مطلوبة'),
});

export class PublicController {
  static async getCourse(_req: Request, res: Response) {
    const data = await PublicService.getCourseInfo();
    res.status(200).json({
      success: true,
      message: 'بيانات الكورس العامة',
      data,
    });
  }

  static async getFreeLesson(_req: Request, res: Response) {
    const data = await PublicService.getFreeLesson();
    res.status(200).json({
      success: true,
      message: 'الدرس المجاني الأول',
      data,
    });
  }

  static async getReviews(_req: Request, res: Response) {
    const reviews = await PublicService.getApprovedReviews();
    res.status(200).json({
      success: true,
      message: 'آراء وتقييمات المشتركين',
      data: reviews,
    });
  }


  static async submitReview(req: Request, res: Response) {
    try {
      const input = ReviewSubmitSchema.parse(req.body);
      const review = await PublicService.submitReview(input);
      res.status(201).json({
        success: true,
        message: 'شكراً لك! تم إرسال تقييمك وسيتم نشره فور مراجعته بواسطة المعلم.',
        data: review,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'بيانات التقييم غير صحيحة',
        details: err.errors,
      });
    }
  }

  static async submitContact(req: Request, res: Response) {
    try {
      const input = ContactSchema.parse(req.body);
      console.log('📬 Contact Form Submitted to Eng. Mustafa Atta:', input);
      res.status(200).json({
        success: true,
        message: 'تم إرسال رسالتك بنجاح! سيتواصل معك المهندس مصطفى عطا في أقرب وقت.',
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'يرجى مراجعة بيانات النموذج',
        details: err.errors,
      });
    }
  }
}
