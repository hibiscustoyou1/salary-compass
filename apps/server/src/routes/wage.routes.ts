import { Router } from 'express';
import { getWages } from '@/controllers/wage.controller';

const router = Router();

// 定义 GET /wages 路由
router.get('/wages', getWages);

export const wageRouter = router;
