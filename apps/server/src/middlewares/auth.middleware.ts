import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: '未授权访问，缺失或无效的 Token 格式' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('[Auth Middleware] JWT_SECRET 未配置在环境变量中');
    return res.status(500).json({ success: false, error: '服务器配置错误' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    // (req as any).user = decoded; // 此处仅用于单用户鉴权拦截，暂不需要注入用户上下文
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token 无效或已过期，请重新登录' });
  }
};
