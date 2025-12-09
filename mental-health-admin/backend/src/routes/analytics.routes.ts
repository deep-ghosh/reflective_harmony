import express from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/overview', authMiddleware, analyticsController.getOverviewMetrics);
router.get('/trend', authMiddleware, analyticsController.getWeeklyTrend);
router.get('/department', authMiddleware, analyticsController.getDepartmentStats);
router.get('/monthly', authMiddleware, analyticsController.getMonthlyComparison);

export default router;
