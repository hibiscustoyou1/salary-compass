import { Router, Express } from 'express';
import { assetRouter } from './asset.routes';
import { wageRouter } from './wage.routes';
import { authRouter } from './auth.routes';
import { verifyToken } from '../middlewares/auth.middleware';

const routes = Router();

// 对外暴露的鉴权路由（不需要 token 即可访问）
routes.use('/api/auth', authRouter);

// 受保护的业务路由
routes.use('/api/assets', verifyToken, assetRouter);
routes.use('/api/wage', verifyToken, wageRouter);

export const initRoutes = (app: Express) => {
  app.use(routes);
  app.all(/^\/api\/.*$/, (req, res) => {
    console.warn(`⚠️ API 404: ${req.path}`);
    res.status(404).json({ success: false, error: '未找到API端点' });
  });
};