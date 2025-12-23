import { Express, Router } from 'express';

import { wageRouter } from './wage.routes';

const routes = Router();

routes.use('/api', wageRouter);

export const initRoutes = (app: Express) => {
  app.use(routes);
  app.all(/^\/api\/.*$/, (req, res) => {
    console.warn(`⚠️ API 404: ${req.path}`);
    res.status(404).json({ success: false, error: '未找到API端点' });
  });
};
