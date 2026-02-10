import { Request, Response } from 'express';
import { prisma } from '@/db';

// 辅助函数：处理 Decimal 和 BigInt 序列化
const serializeEvent = (event: any) => ({
  ...event,
  id: event.id.toString(), // BigInt -> String
  amount: Number(event.amount) // Decimal -> Number
});

// 获取资产变动记录列表 (用于前端“变动记录”Tab)
export const getAssetEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.assetEvent.findMany({
      orderBy: { occurredAt: 'desc' },
      take: 50 // 限制最近 50 条
    });

    res.json({
      success: true,
      data: events.map(serializeEvent)
    });
  } catch (error) {
    console.error('Get asset events error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch asset events' });
  }
};

// 创建资产变动 (提取/结息/校准)
export const createAssetEvent = async (req: Request, res: Response) => {
  try {
    const { type, category, amount, occurredAt, note } = req.body;

    if (!type || amount === undefined || !occurredAt) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // 创建记录
    const newEvent = await prisma.assetEvent.create({
      data: {
        type,      // 'WITHDRAWAL' | 'INTEREST' | 'CALIBRATION'
        category,  // 'RENT', 'LOAN', etc.
        amount: Number(amount), // 确保存入的是数值
        occurredAt: new Date(occurredAt),
        note
      }
    });

    res.json({
      success: true,
      data: serializeEvent(newEvent)
    });
  } catch (error) {
    console.error('Create asset event error:', error);
    res.status(500).json({ success: false, error: 'Failed to create asset event' });
  }
};