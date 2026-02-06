import { Router } from 'express';
import { SalaryController } from '@/controllers/salary.controller';

const router = Router();
router.get('/salary/list', SalaryController.getList);
router.get('/salary/detail', SalaryController.getDetail); // 改为 Query Param 风格
export const salaryRouter = router;