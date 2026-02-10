import { Router } from 'express';
import * as AssetController from '@/controllers/asset.controller';

const router = Router();

// GET /api/assets/events - 获取历史流水
router.get('/assets/events', AssetController.getAssetEvents);

// POST /api/assets/event - 提交新变动
router.post('/assets/event', AssetController.createAssetEvent);

export const assetRouter = router;