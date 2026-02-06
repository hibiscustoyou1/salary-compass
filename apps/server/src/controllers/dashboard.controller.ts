import { Request, Response } from 'express';
import { ApiCode } from '@repo/shared';
import { DashboardService } from '@/services/dashboard.service';

export const DashboardController = {
  async getOverview(req: Request, res: Response) {
    try {
      console.log(`[Dashboard] Fetching overview for personal mode...`);

      // 直接获取，无需参数
      const data = await DashboardService.getOverview();

      res.json({ code: ApiCode.SUCCESS, data });
    } catch (error) {
      console.error('[Dashboard Error]', error);
      res.status(500).json({ code: ApiCode.FAIL, msg: '获取概览失败' });
    }
  }
};