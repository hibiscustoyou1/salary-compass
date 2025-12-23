import { Request, Response, NextFunction } from 'express';
import { hashKey } from '@/utils/crypto';
import { Result } from '@/utils/result';
import { ApiCode } from '@repo/shared';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientKeyHash = req.headers['x-access-key'] as string;
  const serverKey = process.env.ACCESS_KEY;
  
  if (!serverKey) {
    console.error('❌ Server Error: ACCESS_KEY is not defined');
    return Result.fail(res, 'Server configuration error', ApiCode.FAIL, 500);
  }
  
  const serverKeyHash = hashKey(serverKey);
  
  if (!clientKeyHash || clientKeyHash !== serverKeyHash) {
    // 返回标准 40001 错误
    return Result.fail(res, '身份验证失败或密钥已过期', ApiCode.UNAUTHORIZED, 401);
  }
  
  next();
};
