import { Router } from 'express';
import { getWages } from '@/controllers/wage.controller';
import { verifyLogin } from '@/controllers/auth.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();

// ✅ 正确写法：
// 1. 公开接口放前面 (不需要 authMiddleware)
router.post('/verify', verifyLogin);

// 2. 受保护接口放后面 (加上 authMiddleware)
router.get('/wages', authMiddleware, getWages);

export const wageRouter = router;
