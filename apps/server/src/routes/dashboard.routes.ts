import { Router } from 'express';
import { DashboardController } from '@/controllers/dashboard.controller';

const router = Router();
router.get('/dashboard/overview', DashboardController.getOverview);
export const dashboardRouter = router;