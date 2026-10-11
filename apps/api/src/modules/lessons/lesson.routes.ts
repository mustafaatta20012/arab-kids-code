import { Router } from 'express';
import { LessonController } from './lesson.controller';
import { authenticate, optionalAuthenticate } from '../../middleware/auth';

const router = Router();

// Lesson listing and details (supports both visitors and authenticated students/parents)
router.get('/', optionalAuthenticate, LessonController.listLessons);
router.get('/submissions/my', authenticate, LessonController.getMySubmissions);
router.get('/:id', optionalAuthenticate, LessonController.getLessonById);

// Protected student progress, quiz, and project submission routes
router.post('/:id/progress', authenticate, LessonController.updateProgress);
router.post('/:id/quiz', authenticate, LessonController.submitQuiz);
router.post('/:id/submission', authenticate, LessonController.submitProject);

export default router;
