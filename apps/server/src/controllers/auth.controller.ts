import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error('[Auth] JWT_SECRET 未配置在环境变量中');
      return res.status(500).json({ success: false, error: '服务器配置错误' });
    }

    if (!password) {
      return res.status(400).json({ success: false, error: '密码不能为空' });
    }

    if (password !== secret) {
      return res.status(401).json({ success: false, error: '密码错误' });
    }

    // 签发 Token，有效期设为 7 天
    const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '7d' });

    res.json({ success: true, data: { token } });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
};
