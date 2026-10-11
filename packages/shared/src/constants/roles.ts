export enum UserRole {
  VISITOR = 'visitor',
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher',
  SUPER_ADMIN = 'super_admin',
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.VISITOR]: ['view:public_courses', 'view:free_lesson', 'submit:reviews'],
  [UserRole.STUDENT]: [
    'view:unlocked_lessons',
    'submit:quiz',
    'submit:project',
    'view:own_progress',
  ],
  [UserRole.PARENT]: [
    'view:children_progress',
    'manage:children_profiles',
    'view:subscriptions',
    'manage:payments',
  ],
  [UserRole.TEACHER]: [
    'manage:students',
    'manage:parents',
    'manage:lessons',
    'manage:subscriptions',
    'moderate:reviews',
    'view:analytics',
    'view:audit_logs',
  ],
  [UserRole.SUPER_ADMIN]: ['*'],
};
