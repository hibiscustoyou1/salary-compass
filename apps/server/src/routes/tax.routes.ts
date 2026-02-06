import { Router } from 'express';
import { TaxController } from '@/controllers/tax.controller';

const router = Router();
router.get('/tax/analysis', TaxController.getAnalysis);
export const taxRouter = router;