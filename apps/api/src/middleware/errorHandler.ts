import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';
import { env } from '../config/env';

export interface AppError extends Error {
  status?: number;
  code?: string;
  errors?: any;
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const requestId = req.headers['x-request-id'] as string;

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'بيانات الإدخال غير صالحة',
      errors: formattedErrors,
      requestId,
    });
    return;
  }

  // 2. Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyPattern || err.keyValue || {});
    const fieldName = fields[0] || 'الحقل';
    res.status(409).json({
      success: false,
      code: 'DUPLICATE_ENTRY',
      message: `القيمة المدخلة في ${fieldName} مستخدمة مسبقاً، يرجى اختيار قيمة أخرى`,
      requestId,
    });
    return;
  }

  // 3. Mongoose Cast Error (Invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      code: 'INVALID_ID',
      message: 'المعرّف المطلوب غير صالح',
      requestId,
    });
    return;
  }

  // 4. Custom App Error with status
  if (err.status && typeof err.status === 'number') {
    res.status(err.status).json({
      success: false,
      code: err.code || 'BAD_REQUEST',
      message: err.message || 'حدث خطأ في الطلب',
      errors: err.errors,
      requestId,
    });
    return;
  }

  // 5. Unhandled / Internal Server Error
  logger.error(
    {
      requestId,
      err: {
        message: err.message,
        stack: err.stack,
      },
      url: req.originalUrl,
      method: req.method,
    },
    'Unhandled Server Exception',
  );

  res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'حدث خطأ غير متوقع في الخادم، يرجى المحاولة لاحقاً',
    ...(env.NODE_ENV === 'development' ? { stack: err.stack, details: err.message } : {}),
    requestId,
  });
};
