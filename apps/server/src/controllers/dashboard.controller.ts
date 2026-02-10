import { Request, Response } from 'express';
import { prisma } from '@/db';
import { Decimal } from '@prisma/client/runtime/library';

// Helper: 格式化数值
const fmt = (val: Decimal | null | undefined | number) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  return val.toNumber();
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const queryYear = Number(req.query.year);
    const targetYear = isNaN(queryYear) ? new Date().getFullYear() : queryYear;

    // 1. 获取基础薪资数据
    const thisYearData = await prisma.wage.findMany({ where: { year: targetYear } });
    const lastYearData = await prisma.wage.findMany({ where: { year: targetYear - 1 } });

    // 2. 计算常规 Dashboard 指标 (净收入/个税)
    let netIncomeYTD = 0;
    let taxPaidYTD = 0;
    thisYearData.forEach(w => {
      netIncomeYTD += fmt(w.netTotal);
      taxPaidYTD += fmt(w.taxAmount);
    });

    let lastNetIncomeYTD = 0;
    lastYearData.forEach(w => {
      lastNetIncomeYTD += fmt(w.netTotal);
    });

    let netIncomeChange = '+0%';
    if (lastNetIncomeYTD > 0) {
      const diff = netIncomeYTD - lastNetIncomeYTD;
      const percent = (diff / lastNetIncomeYTD) * 100;
      const sign = percent >= 0 ? '+' : '';
      netIncomeChange = `${sign}${percent.toFixed(1)}%`;
    } else if (netIncomeYTD > 0) {
      netIncomeChange = '+100%';
    }

    // === 3. 核心升级：公积金动态计算 (Calibration + Flow) ===

    // A. 寻找最近的一次“校准”事件
    const latestCalibration = await prisma.assetEvent.findFirst({
      where: { type: 'CALIBRATION' },
      orderBy: { occurredAt: 'desc' }
    });

    // B. 初始化基准余额与截止时间
    let providentFundBalance = latestCalibration ? fmt(latestCalibration.amount) : 0;
    const cutoffDate = latestCalibration ? latestCalibration.occurredAt : new Date('1970-01-01');

    // C. 计算“校准日之后”的薪资缴存 (housingFund * 2)
    // 注意：Wage 没有精确日期字段，用 year/period 估算为当月 15 号
    const allWages = await prisma.wage.findMany({
      select: { year: true, period: true, housingFund: true }
    });

    allWages.forEach(w => {
      if (!w.year || !w.period) return;
      // 构造发薪日：该年该月15日
      const payoutDate = new Date(w.year, w.period - 1, 15);

      // 只有在校准日之后的工资单，才计入增量
      if (payoutDate > cutoffDate) {
        providentFundBalance += (fmt(w.housingFund) * 2);
      } else if (!latestCalibration) {
        // 如果没有校准过，则累加所有历史
        providentFundBalance += (fmt(w.housingFund) * 2);
      }
    });

    // D. 计算“校准日之后”的其他资产变动 (提取/结息)
    const subsequentEvents = await prisma.assetEvent.findMany({
      where: {
        type: { not: 'CALIBRATION' }, // 排除校准本身
        occurredAt: { gt: cutoffDate } // 仅限校准日之后
      }
    });

    subsequentEvents.forEach(e => {
      // 提取通常存储为负数，结息为正数，直接累加
      providentFundBalance += fmt(e.amount);
    });

    // === End Core Upgrade ===

    // 4. 企业年金计算 (暂时保持简单累加，后续可按同样逻辑升级)
    let annuityAccumulated = 0;
    const allAnnuityData = await prisma.wage.findMany({
      select: { corporateAnnuity: true }
    });
    allAnnuityData.forEach(w => {
      annuityAccumulated += fmt(w.corporateAnnuity) * 5;
    });

    res.json({
      success: true,
      data: {
        netIncomeYTD: `¥${netIncomeYTD.toLocaleString()}`,
        netIncomeChange,
        taxPaid: `¥${taxPaidYTD.toLocaleString()}`,
        providentFundAccumulated: `¥${providentFundBalance.toLocaleString()}`, // 动态计算结果
        annuityAccumulated: `¥${annuityAccumulated.toLocaleString()}`
      }
    });
  } catch (error) {
    console.error('Dashboard stats error', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};