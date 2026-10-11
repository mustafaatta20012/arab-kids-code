import { z } from 'zod';
export declare const strongPasswordRegex: RegExp;
export declare const passwordValidation: z.ZodString;
export declare const LoginSchema: z.ZodObject<{
    identifier: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    identifier: string;
    password: string;
}, {
    identifier: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof LoginSchema>;
export declare const RegisterParentSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["student", "parent", "teacher"]>>;
    acceptTerms: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    password: string;
    name: string;
    phone: string;
    confirmPassword: string;
    acceptTerms: boolean;
    email?: string | undefined;
    role?: "student" | "parent" | "teacher" | undefined;
}, {
    password: string;
    name: string;
    phone: string;
    confirmPassword: string;
    acceptTerms: boolean;
    email?: string | undefined;
    role?: "student" | "parent" | "teacher" | undefined;
}>, {
    password: string;
    name: string;
    phone: string;
    confirmPassword: string;
    acceptTerms: boolean;
    email?: string | undefined;
    role?: "student" | "parent" | "teacher" | undefined;
}, {
    password: string;
    name: string;
    phone: string;
    confirmPassword: string;
    acceptTerms: boolean;
    email?: string | undefined;
    role?: "student" | "parent" | "teacher" | undefined;
}>;
export type RegisterParentInput = z.infer<typeof RegisterParentSchema>;
export declare const ChangePasswordSchema: z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}>, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export declare const ForgotPasswordSchema: z.ZodObject<{
    identifier: z.ZodString;
}, "strip", z.ZodTypeAny, {
    identifier: string;
}, {
    identifier: string;
}>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export declare const ResetPasswordSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    confirmPassword: string;
    newPassword: string;
    token: string;
}, {
    confirmPassword: string;
    newPassword: string;
    token: string;
}>, {
    confirmPassword: string;
    newPassword: string;
    token: string;
}, {
    confirmPassword: string;
    newPassword: string;
    token: string;
}>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
//# sourceMappingURL=auth.d.ts.map