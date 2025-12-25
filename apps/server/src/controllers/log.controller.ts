import { Request, Response } from 'express';
import { logger } from '@/utils/logger';
import { Result } from '@/utils/result';

export const reportLog = (req: Request, res: Response) => {
  const { level, message, stack, info } = req.body;
  
  // 记录前端传来的日志，标记 source 为 Client
  logger.log({
    level: level || 'error',
    message: message || 'Unknown Client Error',
    source: 'Client', // 关键：标记来源
    stack,
    ...info
  });
  
  return Result.success(res, null, 'Log reported');
};
