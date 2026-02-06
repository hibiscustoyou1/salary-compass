import { Request, Response } from 'express';
import { ApiCode } from '@repo/shared';
import { SalaryService } from '@/services/salary.service';

export const SalaryController = {
  async getList(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 12;
      const data = await SalaryService.getList(page, pageSize);
      res.json({ code: ApiCode.SUCCESS, data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ code: ApiCode.FAIL, msg: '获取列表失败' });
    }
  },

  async getDetail(req: Request, res: Response) {
    try {
      const year = Number(req.query.year);
      const month = Number(req.query.month);
      if (!year || !month) throw new Error('参数缺失');

      const data = await SalaryService.getDetail(year, month);
      res.json({ code: ApiCode.SUCCESS, data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ code: ApiCode.FAIL, msg: '获取详情失败' });
    }
  }
};