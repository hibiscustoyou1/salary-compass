import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Result } from '@/utils/result';
import { ApiCode } from '@repo/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'salary-compass-secret-key-change-me';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 获取标准 Authorization 头
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // 格式: "Bearer <token>"
  
  if (!token) {
    // 如果没有 Token，直接拒绝
    return Result.fail(res, '请先登录', ApiCode.UNAUTHORIZED, 401);
  }
  
  jwt.verify(token, JWT_SECRET, (err) => {
    if (err) {
      // Token 过期或无效
      return Result.fail(res, '凭证已过期，请重新登录', ApiCode.UNAUTHORIZED, 401);
    }
    // 验证通过
    next();
  });
};
