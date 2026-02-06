import { Router } from 'express';
import { BenefitsController } from '@/controllers/benefits.controller';

const router = Router();
router.get('/benefits/prediction', BenefitsController.getPrediction);
// 移除了 POST /settings
export const benefitsRouter = router;