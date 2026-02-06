import { Router, Express } from 'express';
import { helloRouter } from './hello.routes';
import { dashboardRouter } from './dashboard.routes';
import { salaryRouter } from './salary.routes';
import { taxRouter } from './tax.routes';
import { benefitsRouter } from './benefits.routes';

const routes = Router();

// 聚合所有模块路由
routes.use('/api', helloRouter);
routes.use('/api', dashboardRouter);
routes.use('/api', salaryRouter);
routes.use('/api', taxRouter);
routes.use('/api', benefitsRouter);

export const initRoutes = (app: Express) => {
  app.use(routes);

  // 404 处理
  app.all(/^\/api\/.*$/, (req, res) => {
    console.warn(`⚠️ API 404: ${req.path}`);
    res.status(404).json({ code: 404, msg: '未找到API端点' });
  });
};