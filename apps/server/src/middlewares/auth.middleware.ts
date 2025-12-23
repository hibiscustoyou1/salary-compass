import { Request, Response, NextFunction } from 'express';
import { hashKey } from '@/utils/crypto';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 1. 获取前端传来的 Hash (Header 中)
  const clientKeyHash = req.headers['x-access-key'] as string;
  const serverKey = process.env.ACCESS_KEY;
  
  // 2. 检查服务端配置
  if (!serverKey) {
    console.error('❌ Server Error: ACCESS_KEY is not defined in .env');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }
  
  // 3. 计算服务端 Key 的 Hash
  const serverKeyHash = hashKey(serverKey);
  
  // 4. 比对 Hash
  if (!clientKeyHash || clientKeyHash !== serverKeyHash) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Access Key' });
  }
  
  next();
};
