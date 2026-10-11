"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordSchema = exports.ForgotPasswordSchema = exports.ChangePasswordSchema = exports.RegisterParentSchema = exports.LoginSchema = exports.passwordValidation = exports.strongPasswordRegex = void 0;
const zod_1 = require("zod");
exports.strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
exports.passwordValidation = zod_1.z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(exports.strongPasswordRegex, 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم واحد على الأقل');
exports.LoginSchema = zod_1.z.object({
    identifier: zod_1.z.string().min(1, 'اسم المستخدم أو البريد الإلكتروني أو رقم الهاتف مطلوب'),
    password: zod_1.z.string().min(6, 'كلمة المرور مطلوبة'),
});
exports.RegisterParentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
    email: zod_1.z.string().email('البريد الإلكتروني غير صحيح').optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().min(8, 'رقم الهاتف يجب أن يكون 8 أرقام على الأقل'),
    password: exports.passwordValidation,
    confirmPassword: zod_1.z.string(),
    role: zod_1.z.enum(['student', 'parent', 'teacher']).optional(),
    acceptTerms: zod_1.z.boolean().refine((val) => val === true, 'يجب الموافقه على الشروط وسياسة الخصوصية'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
});
exports.ChangePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: exports.passwordValidation,
    confirmPassword: zod_1.z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
});
exports.ForgotPasswordSchema = zod_1.z.object({
    identifier: zod_1.z.string().min(3, 'البريد الإلكتروني أو اسم المستخدم أو رقم الهاتف مطلوب'),
});
exports.ResetPasswordSchema = zod_1.z
    .object({
    token: zod_1.z.string().min(10, 'رمز التحقق غير صالح'),
    newPassword: exports.passwordValidation,
    confirmPassword: zod_1.z.string(),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
});
//# sourceMappingURL=auth.js.map