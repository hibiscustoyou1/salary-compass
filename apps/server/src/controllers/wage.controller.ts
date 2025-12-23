import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Result } from '@/utils/result';

const prisma = new PrismaClient();

export const getWages = async (req: Request, res: Response) => {
  try {
    const wages = await prisma.wage.findMany({
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });
    
    // 使用 Result 工具包装数据
    return Result.success(res, wages);
    
  } catch (error) {
    console.error("获取薪酬数据失败:", error);
    return Result.fail(res, "服务器内部错误");
  }
};
