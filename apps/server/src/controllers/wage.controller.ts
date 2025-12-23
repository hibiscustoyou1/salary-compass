// server/src/controllers/wageController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getWages = async (req: Request, res: Response) => {
  try {
    // 查询所有薪资记录，按时间倒序排列
    const wages = await prisma.wage.findMany({
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });
    
    // 这里可以添加额外的数据清洗逻辑，例如计算总数等
    // 目前直接返回标准结构
    res.json({
      success: true,
      data: wages,
      total: wages.length
    });
    
  } catch (error) {
    console.error("获取薪酬数据失败:", error);
    res.status(500).json({
      success: false,
      message: "服务器内部错误"
    });
  }
};
