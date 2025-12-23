import { Request, Response } from 'express';
import { hashKey } from '@/utils/crypto';
import { Result } from '@/utils/result';
import { ApiCode } from '@repo/shared';

export const verifyLogin = (req: Request, res: Response) => {
  const { key } = req.body;
  const serverKey = process.env.ACCESS_KEY;
  
  if (!serverKey) {
    return Result.fail(res, 'Server configuration error', ApiCode.FAIL, 500);
  }
  
  const serverKeyHash = hashKey(serverKey);
  
  if (key === serverKeyHash) {
    // 成功：返回空数据或简单对象
    return Result.success(res, { verified: true }, '验证通过');
  } else {
    // 失败
    return Result.fail(res, '访问密钥错误', ApiCode.UNAUTHORIZED);
  }
};
