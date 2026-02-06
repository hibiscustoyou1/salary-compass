import { Request, Response } from 'express';
import { ApiCode } from '@repo/shared';
import { BenefitsService } from '@/services/benefits.service';

export const BenefitsController = {
  async getPrediction(req: Request, res: Response) {
    try {
      const data = await BenefitsService.getPrediction();
      res.json({ code: ApiCode.SUCCESS, data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ code: ApiCode.FAIL, msg: '获取福利预测数据失败' });
    }
  }

  // 删除了 updateSettings 方法
};