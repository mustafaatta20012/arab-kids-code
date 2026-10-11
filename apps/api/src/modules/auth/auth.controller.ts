import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { setRefreshCookie, clearRefreshCookie } from '../../utils/tokens';
import {
  LoginSchema,
  RegisterParentSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '@arab-kids-code/shared';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const input = LoginSchema.parse(req.body);
      const result = await AuthService.login(input);
      setRefreshCookie(res, result.refreshToken);

      res.status(200).json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (err: any) {
      const status = err.status || 400;
      res.status(status).json({
        success: false,
        code: err.code || 'LOGIN_ERROR',
        message: err.message || 'فشل تسجيل الدخول',
        details: err.errors,
      });
    }
  }

  static async registerParent(req: Request, res: Response) {
    try {
      const input = RegisterParentSchema.parse(req.body);
      const result = await AuthService.registerParent(input);
      setRefreshCookie(res, result.refreshToken);

      res.status(201).json({
        success: true,
        message: 'تم إنشاء حساب ولي الأمر بنجاح',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (err: any) {
      const status = err.status || 400;
      res.status(status).json({
        success: false,
        code: err.code || 'REGISTER_ERROR',
        message: err.message || 'فشل إنشاء الحساب',
        details: err.errors,
      });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const tokenFromCookie = req.cookies?.refreshToken;
      const tokenFromHeader = req.body?.refreshToken;
      const token = tokenFromCookie || tokenFromHeader;

      const result = await AuthService.refreshToken(token);
      setRefreshCookie(res, result.refreshToken);

      res.status(200).json({
        success: true,
        message: 'تم تجديد الرمز بنجاح',
        data: {
          accessToken: result.accessToken,
        },
      });
    } catch (err: any) {
      res.status(err.status || 401).json({
        success: false,
        code: err.code || 'REFRESH_ERROR',
        message: err.message || 'فشل تجديد الرمز',
      });
    }
  }

  static async logout(_req: Request, res: Response) {
    clearRefreshCookie(res);
    res.status(200).json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح',
    });
  }

  static async getMe(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const me = await AuthService.getMe(userId);
      res.status(200).json({
        success: true,
        message: 'تم جلب بيانات الحساب',
        data: me,
      });
    } catch (err: any) {
      res.status(err.status || 500).json({
        success: false,
        code: err.code || 'GET_ME_ERROR',
        message: err.message || 'خطأ في جلب البيانات',
      });
    }
  }

  static async changePassword(req: any, res: Response) {
    try {
      const input = ChangePasswordSchema.parse(req.body);
      const userId = req.user.userId;
      const result = await AuthService.changePassword(userId, input);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err: any) {
      const status = err.status || 400;
      res.status(status).json({
        success: false,
        code: err.code || 'CHANGE_PASSWORD_ERROR',
        message: err.message || 'فشل تغيير كلمة المرور',
        details: err.errors,
      });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const input = ForgotPasswordSchema.parse(req.body);
      const result = await AuthService.forgotPassword(input.identifier);

      res.status(200).json(result);
    } catch (err: any) {
      const status = err.status || 400;
      res.status(status).json({
        success: false,
        code: err.code || 'FORGOT_PASSWORD_ERROR',
        message: err.message || 'فشل إرسال طلب استعادة كلمة المرور',
        details: err.errors,
      });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const input = ResetPasswordSchema.parse(req.body);
      const result = await AuthService.resetPassword(input.token, input.newPassword);

      res.status(200).json(result);
    } catch (err: any) {
      const status = err.status || 400;
      res.status(status).json({
        success: false,
        code: err.code || 'RESET_PASSWORD_ERROR',
        message: err.message || 'فشل إعادة تعيين كلمة المرور',
        details: err.errors,
      });
    }
  }
}

