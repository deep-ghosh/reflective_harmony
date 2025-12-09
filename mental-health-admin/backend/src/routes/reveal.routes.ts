import express from 'express';
import { revealController } from '../controllers/reveal.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbacMiddleware } from '../middleware/rbac.middleware';

const router = express.Router();

router.post('/request', authMiddleware, rbacMiddleware(['admin']), revealController.requestReveal);
router.post('/approve', authMiddleware, rbacMiddleware(['approver']), revealController.approveReveal);

export default router;
