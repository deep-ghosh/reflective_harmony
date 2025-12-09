import express from 'express';
import { auditController } from '../controllers/audit.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbacMiddleware } from '../middleware/rbac.middleware';

const router = express.Router();

router.get('/', authMiddleware, rbacMiddleware(['admin', 'auditor']), auditController.getAuditLogs);

export default router;
