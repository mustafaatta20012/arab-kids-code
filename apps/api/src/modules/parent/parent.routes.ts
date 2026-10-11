import { Router } from 'express';
import { ParentController } from './parent.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '@arab-kids-code/shared';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.PARENT, UserRole.TEACHER));

router.get('/children', ParentController.getMyChildren);
router.post('/children', ParentController.addChild);

export default router;
