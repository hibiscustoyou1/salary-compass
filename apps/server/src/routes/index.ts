import { Express, Router } from 'express';

import { wageRouter } from './wage.routes';

const routes = Router();

routes.use('/api', wageRouter);

export const initRoutes = (app: Express) => {
  app.post('/api/verify', (req, res) => {
    const { key } = req.body;
    if (key === process.env.ACCESS_KEY) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false });
    }
  });
  app.use(routes);
  app.all(/^\/api\/.*$/, (req, res) => {
    console.warn(`⚠️ API 404: ${req.path}`);
    res.status(404).json({ success: false, error: '未找到API端点' });
  });
};
