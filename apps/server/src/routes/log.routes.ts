import { Router } from 'express';
import { reportLog } from '@/controllers/log.controller';

const router = Router();

// 接收前端日志上报
router.post('/report', reportLog);

export { router as logRouter };
