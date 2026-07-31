import { Router } from 'express';
import * as wageController from '../controllers/wage.controller';
import * as dashboardController from '../controllers/dashboard.controller';
import * as benefitsController from '../controllers/benefits.controller';

const router = Router();

// 工资条历史
router.get('/salary/history', wageController.getSalaryHistory);

// 仪表盘数据
router.get('/dashboard/stats', dashboardController.getDashboardStats);

// 福利概览数据
router.get('/benefits/stats', benefitsController.getBenefitsStats);

export const wageRouter = router;