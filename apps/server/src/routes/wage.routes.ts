import { Router } from 'express';
// [修改] 引入新的 controller 方法
import { getSalaryHistory, getDashboardStats, getBenefitsStats } from '@/controllers/wage.controller';

const router = Router();

router.get('/salary/history', getSalaryHistory);
router.get('/dashboard/stats', getDashboardStats);
// [新增] 福利接口
router.get('/benefits/stats', getBenefitsStats);

export { router as wageRouter };