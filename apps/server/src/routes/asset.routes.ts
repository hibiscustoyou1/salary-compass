import { Router } from 'express';
import * as AssetController from '@/controllers/asset.controller';

const router = Router();

// GET /api/assets/events - 获取历史流水
router.get('/events', AssetController.getAssetEvents);

// POST /api/assets/event - 提交新变动
router.post('/event', AssetController.createAssetEvent);

router.delete('/event/:id', AssetController.deleteAssetEvent);

export const assetRouter = router;