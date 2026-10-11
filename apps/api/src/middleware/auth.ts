import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/tokens';
import { UserRole, ROLE_PERMISSIONS } from '@arab-kids-code/shared';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'غير مصرح الوصول، يرجى تسجيل الدخول أولاً',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (_err) {
    res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: 'رمز الجلسة غير صالح أو منتهي الصلاحية',
    });
  }
};

export const optionalAuthenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }
  } catch (_err) {
    // Ignore invalid token on optional routes
  }
  next();
};


export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'غير مصرح الوصول',
      });
      return;
    }

    if (!roles.includes(req.user.role) && req.user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'ليس لديك الصلاحية الكافية للوصول لهذا المورد',
      });
      return;
    }

    next();
  };
};

export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'غير مصرح الوصول',
      });
      return;
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasPerm =
      userPermissions.includes('*') || userPermissions.includes(permission);

    if (!hasPerm) {
      res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'ليس لديك الإذن المطلوب لإتمام هذه العملية',
      });
      return;
    }

    next();
  };
};
