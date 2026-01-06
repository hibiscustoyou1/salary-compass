import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { hashKey } from '@/utils/crypto';
import { Result } from '@/utils/result';
import { ApiCode } from '@repo/shared';

// 生产环境应生成一个复杂的随机字符串
const JWT_SECRET = process.env.JWT_SECRET || 'salary-compass-secret-key-change-me';

export const verifyLogin = (req: Request, res: Response) => {
  const { key } = req.body;
  const serverKey = process.env.ACCESS_KEY;
  
  if (!serverKey) {
    return Result.fail(res, 'Server configuration error', ApiCode.FAIL, 500);
  }
  
  // 比对 Hash
  const serverKeyHash = hashKey(serverKey);
  
  if (key === serverKeyHash) {
    // ✅ 验证通过：签发 Token
    const token = jwt.sign({ role: 'viewer' }, JWT_SECRET, { expiresIn: '7d' });
    
    // 返回 Token 给前端
    return Result.success(res, { token }, '验证通过');
  } else {
    return Result.fail(res, '访问密钥错误', ApiCode.UNAUTHORIZED);
  }
};
