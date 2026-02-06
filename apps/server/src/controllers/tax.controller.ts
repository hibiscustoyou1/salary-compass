import { Request, Response } from 'express';
import { ApiCode } from '@repo/shared';
import { TaxService } from '@/services/tax.service';

export const TaxController = {
  async getAnalysis(req: Request, res: Response) {
    try {
      const data = await TaxService.getAnalysis();
      res.json({ code: ApiCode.SUCCESS, data });
    } catch (error) {
      res.status(500).json({ code: ApiCode.FAIL, msg: '获取税务分析失败' });
    }
  }
};