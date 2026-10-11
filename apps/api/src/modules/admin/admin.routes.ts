import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '@arab-kids-code/shared';

const router = Router();

// Protect all admin routes for Teacher and Super Admin
router.use(authenticate);
router.use(authorize(UserRole.TEACHER, UserRole.SUPER_ADMIN));

// Analytics & Reports
router.get('/analytics', AdminController.getAnalytics);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/export/students.csv', AdminController.exportStudentsCsv);

// Students & Family CRUD
router.get('/students', AdminController.listStudents);
router.post('/family', AdminController.createFamily);
router.post('/subscriptions/:studentId', AdminController.updateSubscription);
// User Access Control & Approvals (Visible/Usable only by Teacher)
router.get('/users', AdminController.listUsers);
router.patch('/users/:id/approval', AdminController.updateUserApproval);
router.post('/users/:id/renew', AdminController.renewSubscription);
router.post('/users/:id/revoke', AdminController.revokeSubscription);

// Moderation Queues
router.get('/reviews/pending', AdminController.getPendingReviews);
router.patch('/reviews/:id', AdminController.moderateReview);

router.get('/submissions/pending', AdminController.getPendingSubmissions);
router.patch('/submissions/:id', AdminController.gradeSubmission);

export default router;
