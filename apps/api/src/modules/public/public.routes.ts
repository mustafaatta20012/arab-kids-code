import { Router } from 'express';
import { PublicController } from './public.controller';

const router = Router();

router.get('/course', PublicController.getCourse);
router.get('/lessons/free', PublicController.getFreeLesson);
router.get('/reviews', PublicController.getReviews);
router.post('/reviews', PublicController.submitReview);
router.post('/contact', PublicController.submitContact);

export default router;
