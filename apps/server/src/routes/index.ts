import { Router, Express } from 'express';
import { assetRouter } from './asset.routes';
import { wageRouter } from './wage.routes'; // [新增]

const routes = Router();

routes.use('/api/assets', assetRouter);
routes.use('/api/wage', wageRouter); // [新增]

export const initRoutes = (app: Express) => {
  app.use(routes);
  app.all(/^\/api\/.*$/, (req, res) => {
    console.warn(`⚠️ API 404: ${req.path}`);
    res.status(404).json({ success: false, error: '未找到API端点' });
  });
};