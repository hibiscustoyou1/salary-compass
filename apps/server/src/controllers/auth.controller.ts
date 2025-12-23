import { Request, Response } from 'express';
import { hashKey } from '@/utils/crypto';

export const verifyLogin = (req: Request, res: Response) => {
  // 1. 获取前端传来的 Hash (Body 中)
  const { key } = req.body;
  const serverKey = process.env.ACCESS_KEY;
  
  if (!serverKey) {
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }
  
  // 2. 计算服务端 Key 的 Hash
  const serverKeyHash = hashKey(serverKey);
  
  // 3. 比对两个 Hash
  if (key === serverKeyHash) {
    return res.json({ success: true, message: 'Verified' });
  } else {
    return res.status(401).json({ success: false, message: '密钥错误' });
  }
};
