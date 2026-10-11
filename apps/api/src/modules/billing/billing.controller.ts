import { Request, Response } from 'express';
import { BillingService } from './billing.service';
import { AuthenticatedRequest } from '../../middleware/auth';
import { z } from 'zod';

const CheckoutSchema = z.object({
  studentId: z.string().min(1, 'معرف الطفل مطلوب'),
  provider: z.enum(['paymob', 'fawry', 'manual']).default('paymob'),
});

export class BillingController {
  static async checkout(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { studentId, provider } = CheckoutSchema.parse(req.body);

      const session = await BillingService.createCheckoutSession(userId, studentId, provider);
      res.status(200).json({
        success: true,
        message: 'تم إنشاء جلسة الدفع بنجاح',
        data: session,
      });
    } catch (err: any) {
      res.status(err.status || 400).json({
        success: false,
        code: err.code || 'CHECKOUT_ERROR',
        message: err.message || 'فشل إتمام عملية الدفع',
        details: err.errors,
      });
    }
  }

  static async handleWebhook(req: Request, res: Response) {
    try {
      const provider = req.params.provider as 'paymob' | 'fawry' | 'manual';
      const signature = (req.headers['x-paymob-hmac'] || req.headers['x-fawry-signature']) as string;

      const result = await BillingService.handleWebhook(provider, req.body, signature);
      res.status(200).json(result);
    } catch (err: any) {
      console.error('Webhook Error:', err);
      res.status(err.status || 400).json({
        success: false,
        code: err.code || 'WEBHOOK_ERROR',
        message: err.message || 'فشل معالجة الويب هوك',
      });
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const history = await BillingService.getBillingHistory(userId);
      res.status(200).json({
        success: true,
        message: 'سجل المدفوعات والفواتير',
        data: history,
      });
    } catch (_err: any) {
      res.status(500).json({
        success: false,
        code: 'BILLING_HISTORY_ERROR',
        message: 'فشل جلب سجل الفواتير',
      });
    }
  }
}
