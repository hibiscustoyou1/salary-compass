import { Request, Response } from 'express';
import { prisma } from '@/db';
import { Decimal } from '@prisma/client/runtime/library';

const fmt = (val: Decimal | null | undefined | number) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  return val.toNumber();
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const queryYear = Number(req.query.year);
    const targetYear = isNaN(queryYear) ? new Date().getFullYear() : queryYear;

    const thisYearData = await prisma.wage.findMany({ where: { year: targetYear } });
    const lastYearData = await prisma.wage.findMany({ where: { year: targetYear - 1 } });
    const allTimeData = await prisma.wage.findMany({
      select: { housingFund: true, corporateAnnuity: true }
    });

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

    let providentFundAccumulated = 0;
    let annuityAccumulated = 0;
    allTimeData.forEach(w => {
      providentFundAccumulated += fmt(w.housingFund) * 2;
      annuityAccumulated += fmt(w.corporateAnnuity) * 5;
    });

    res.json({
      success: true,
      data: {
        netIncomeYTD: `¥${netIncomeYTD.toLocaleString()}`,
        netIncomeChange,
        taxPaid: `¥${taxPaidYTD.toLocaleString()}`,
        providentFundAccumulated: `¥${providentFundAccumulated.toLocaleString()}`,
        annuityAccumulated: `¥${annuityAccumulated.toLocaleString()}`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};