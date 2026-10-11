"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["VISITOR"] = "visitor";
    UserRole["STUDENT"] = "student";
    UserRole["PARENT"] = "parent";
    UserRole["TEACHER"] = "teacher";
    UserRole["SUPER_ADMIN"] = "super_admin";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.ROLE_PERMISSIONS = {
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
//# sourceMappingURL=roles.js.map