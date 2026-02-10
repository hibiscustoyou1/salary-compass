import { Request, Response } from 'express';
import { prisma } from '@/db';

const serializeEvent = (event: any) => ({
  ...event,
  id: event.id.toString(),
  amount: Number(event.amount)
});

// [修改] 支持 limit 查询参数
export const getAssetEvents = async (req: Request, res: Response) => {
  try {
    const limitParam = req.query.limit;
    const limit = limitParam ? Number(limitParam) : undefined;

    const events = await prisma.assetEvent.findMany({
      orderBy: { occurredAt: 'desc' },
      take: limit // 如果 undefined，则查询所有 (或 Prisma 默认行为)
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

export const createAssetEvent = async (req: Request, res: Response) => {
  try {
    const { type, category, amount, occurredAt, note } = req.body;
    if (!type || amount === undefined || !occurredAt) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const newEvent = await prisma.assetEvent.create({
      data: {
        type, category, amount: Number(amount), occurredAt: new Date(occurredAt), note
      }
    });
    res.json({ success: true, data: serializeEvent(newEvent) });
  } catch (error) {
    console.error('Create asset event error:', error);
    res.status(500).json({ success: false, error: 'Failed to create asset event' });
  }
};

export const deleteAssetEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 物理删除 (或者你可以选择软删除，视业务需求而定，这里MVP使用物理删除)
    await prisma.assetEvent.delete({
      where: { id: BigInt(id) }
    });

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete asset event error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete event' });
  }
};