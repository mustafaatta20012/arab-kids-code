import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, Parent, Student } from '../../models';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/tokens';
import { LoginInput, RegisterParentInput, ChangePasswordInput } from '@arab-kids-code/shared';
import { EmailService } from '../notifications/email.service';

export class AuthService {
  static async login(input: LoginInput) {
    const { identifier, password } = input;

    // Search user by email, phone, or username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier },
        { username: identifier.toLowerCase() },
      ],
    }).select('+passwordHash');

    if (!user) {
      throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'بيانات الدخول غير صحيحة' };
    }

    // Check account lockout status
    if (user.status === 'locked' || (user.lockedUntil && user.lockedUntil > new Date())) {
      throw {
        status: 403,
        code: 'ACCOUNT_LOCKED',
        message: 'تم حظر الحساب مؤقتاً بسبب تكرار المحاولات الخاطئة. يرجى المحاولة لاحقاً بعد 15 دقيقة',
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      user.failedLogins += 1;
      if (user.failedLogins >= 5) {
        user.status = 'locked';
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
      }
      await user.save();
      throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'بيانات الدخول غير صحيحة' };
    }

    // Reset failed login counter on success
    user.failedLogins = 0;
    user.status = 'active';
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
        approved: user.role === 'teacher' || user.role === 'super_admin' ? true : (user.approved ?? false),
        approvalStatus: user.role === 'teacher' || user.role === 'super_admin' ? 'approved' : (user.approvalStatus ?? 'pending'),
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
        email: user.email,
        phone: user.phone,
        username: user.username,
        mustChangePassword: user.mustChangePassword,
      },
      accessToken,
      refreshToken,
    };
  }

  static async registerParent(input: RegisterParentInput) {
    const { name, email, phone, password, role } = input;

    // Check existing email/phone
    const existingUser = await User.findOne({
      $or: [
        ...(email ? [{ email: email.toLowerCase() }] : []),
        { phone: phone },
      ],
    });

    if (existingUser) {
      throw {
        status: 400,
        code: 'USER_EXISTS',
        message: 'يوجد حساب مسجل بالفعل بهذا البريد أو رقم الهاتف',
      };
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Default to student role unless specified (e.g. parent)
    const userRole = role === 'parent' ? 'parent' : 'student';

    // New accounts are set to pending approval by default
    const user = await User.create({
      name,
      email: email ? email.toLowerCase() : undefined,
      phone,
      passwordHash,
      role: userRole as any,
      status: 'active',
      approved: false,
      approvalStatus: 'pending',
    });

    let profileId = '';
    if (userRole === 'parent') {
      const parent = await Parent.create({
        userId: user._id,
        phone,
        children: [],
      });
      profileId = parent._id.toString();
    } else {
      // For student accounts, create an initial parent container to satisfy schema if needed
      const placeholderParent = await Parent.create({
        userId: user._id,
        phone,
        children: [],
      });
      const student = await Student.create({
        userId: user._id,
        parentId: placeholderParent._id,
        displayName: user.name,
        birthYear: 2014,
        avatar: 'avatar_robot_blue.png',
        level: 1,
        xp: 0,
      });
      placeholderParent.children.push(student._id as any);
      await placeholderParent.save();
      profileId = student._id.toString();
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user._id.toString(),
        profileId,
        name: user.name,
        role: user.role,
        approved: false,
        approvalStatus: 'pending' as const,
        phone: user.phone,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw { status: 401, code: 'TOKEN_REQUIRED', message: 'رمز التحديث مطلوب' };
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);
      if (!user || user.status === 'locked') {
        throw { status: 401, code: 'INVALID_USER', message: 'المستخدم غير متاح' };
      }

      const payload = {
        userId: user._id.toString(),
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      };

      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (_err) {
      throw { status: 401, code: 'INVALID_REFRESH_TOKEN', message: 'رمز التحديث غير صالح' };
    }
  }

  static async getMe(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw { status: 404, code: 'USER_NOT_FOUND', message: 'المستخدم غير موجود' };
    }

    let extraProfile = {};
    if (user.role === 'parent') {
      const parent = await Parent.findOne({ userId: user._id }).populate('children');
      extraProfile = { parentProfile: parent };
    } else if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      extraProfile = { studentProfile: student };
    }

    return {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      approved: user.role === 'teacher' || user.role === 'super_admin' ? true : (user.approved ?? false),
      approvalStatus: user.role === 'teacher' || user.role === 'super_admin' ? 'approved' : (user.approvalStatus ?? 'pending'),
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
      email: user.email,
      phone: user.phone,
      username: user.username,
      mustChangePassword: user.mustChangePassword,
      ...extraProfile,
    };
  }

  static async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw { status: 404, code: 'USER_NOT_FOUND', message: 'المستخدم غير موجود' };
    }

    const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isValid) {
      throw { status: 400, code: 'INVALID_PASSWORD', message: 'كلمة المرور الحالية غير صحيحة' };
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(input.newPassword, salt);
    user.mustChangePassword = false;
    await user.save();

    return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
  }

  static async forgotPassword(identifier: string) {
    if (!identifier) {
      throw { status: 400, code: 'IDENTIFIER_REQUIRED', message: 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف أو اسم المستخدم' };
    }

    const normalized = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [
        { email: normalized },
        { phone: identifier.trim() },
        { username: normalized },
      ],
    });

    // Timing-attack and user-enumeration mitigation: return consistent message even if user not found
    if (!user) {
      return {
        success: true,
        message: 'إذا كان الحساب مسجلاً لدينا، فسيتم إرسال تعليمات إعادة تعيين كلمة المرور.',
      };
    }

    // Generate unguessable 32-byte crypto token
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'https://arabkidscode.com';
    const resetUrl = `${clientUrl}/reset-password?token=${rawResetToken}`;

    if (user.email) {
      await EmailService.sendPasswordResetEmail(user.email, user.name, resetUrl);
    }

    return {
      success: true,
      message: 'تم إرسال تعليمات إعادة تعيين كلمة المرور بنجاح.',
      ...(process.env.NODE_ENV !== 'production' ? { resetToken: rawResetToken, resetUrl } : {}),
    };
  }

  static async resetPassword(token: string, newPassword: string) {
    if (!token) {
      throw { status: 400, code: 'TOKEN_REQUIRED', message: 'رمز التحقق مطلوب' };
    }

    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+passwordHash');

    if (!user) {
      throw {
        status: 400,
        code: 'INVALID_OR_EXPIRED_TOKEN',
        message: 'رمز استعادة كلمة المرور غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.',
      };
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.failedLogins = 0;
    user.status = 'active';
    user.lockedUntil = undefined;
    user.mustChangePassword = false;
    await user.save();

    return {
      success: true,
      message: 'تمت إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
    };
  }
}
