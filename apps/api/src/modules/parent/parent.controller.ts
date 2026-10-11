import { Response } from 'express';
import { ParentService } from './parent.service';
import { AuthenticatedRequest } from '../../middleware/auth';
import { z } from 'zod';

const AddChildSchema = z.object({
  displayName: z.string().min(2, 'اسم الطفل مطلوب'),
  birthYear: z.number().min(2005).max(2022),
  avatar: z.string().optional(),
  username: z.string().min(3).optional(),
  password: z.string().min(4).optional(),
});

export class ParentController {
  static async getMyChildren(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const data = await ParentService.getMyChildren(userId);
      res.status(200).json({
        success: true,
        message: 'بيانات حسابات الأطفال وحالة التقدم',
        data,
      });
    } catch (err: any) {
      res.status(err.status || 500).json({
        success: false,
        code: err.code || 'GET_CHILDREN_ERROR',
        message: err.message || 'فشل جلب بيانات الأطفال',
      });
    }
  }

  static async addChild(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const input = AddChildSchema.parse(req.body);
      const result = await ParentService.addChild(userId, input);
      res.status(201).json({
        success: true,
        message: 'تم إضافة ملف الطفل بنجاح',
        data: result,
      });
    } catch (err: any) {
      res.status(err.status || 400).json({
        success: false,
        code: err.code || 'ADD_CHILD_ERROR',
        message: err.message || 'فشل إضافة الطفل',
        details: err.errors,
      });
    }
  }
}
