import { Express, Router } from 'express';
import { wageRouter } from './wage.routes';
import { Result } from '@/utils/result';
import { ApiCode } from '@repo/shared';

const routes = Router();

routes.use('/api', wageRouter);

export const initRoutes = (app: Express) => {
  app.use(routes);
  
  // 全局 404 处理
  app.all(/^\/api\/.*$/, (req, res) => {
    console.warn(`⚠️ API 404: ${req.path}`);
    Result.fail(res, `接口不存在: ${req.path}`, ApiCode.NOT_FOUND, 404);
  });
};
