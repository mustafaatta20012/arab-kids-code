import { z } from 'zod';

export const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export const passwordValidation = z
  .string()
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .regex(
    strongPasswordRegex,
    'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم واحد على الأقل',
  );

export const LoginSchema = z.object({
  identifier: z.string().min(1, 'اسم المستخدم أو البريد الإلكتروني أو رقم الهاتف مطلوب'),
  password: z.string().min(6, 'كلمة المرور مطلوبة'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterParentSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  phone: z.string().min(8, 'رقم الهاتف يجب أن يكون 8 أرقام على الأقل'),
  password: passwordValidation,
  confirmPassword: z.string(),
  role: z.enum(['student', 'parent', 'teacher']).optional(),
  acceptTerms: z.boolean().refine((val) => val === true, 'يجب الموافقه على الشروط وسياسة الخصوصية'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
});

export type RegisterParentInput = z.infer<typeof RegisterParentSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: passwordValidation,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export const ForgotPasswordSchema = z.object({
  identifier: z.string().min(3, 'البريد الإلكتروني أو اسم المستخدم أو رقم الهاتف مطلوب'),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(10, 'رمز التحقق غير صالح'),
    newPassword: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

