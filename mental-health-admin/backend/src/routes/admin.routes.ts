import express from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbacMiddleware } from '../middleware/rbac.middleware';

const router = express.Router();

router.post('/contact', authMiddleware, rbacMiddleware(['admin']), adminController.accessContact);
router.get('/critical', authMiddleware, rbacMiddleware(['admin']), adminController.getCriticalStudents);
router.get('/critical/:anonId', authMiddleware, rbacMiddleware(['admin']), adminController.getStudentDetail);

export default router;
