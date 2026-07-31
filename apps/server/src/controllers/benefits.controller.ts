import { Request, Response } from 'express';
import { prisma } from '@/db';
import { Decimal } from '@prisma/client/runtime/library';

const fmt = (val: Decimal | null | undefined | number) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  return val.toNumber();
};

export const getBenefitsStats = async (req: Request, res: Response) => {
  try {
    const allWages = await prisma.wage.findMany();
    let totalHousingFund = 0;
    let totalAnnuity = 0;

    allWages.forEach(w => {
      totalHousingFund += fmt(w.housingFund) * 2;
      // [修复 Bug] 企业年金配比为 公司4:个人1，总计应当为个人缴纳的 5 倍
      totalAnnuity += fmt(w.corporateAnnuity) * 5;
    });

    const lastRecord = await prisma.wage.findFirst({
      orderBy: [{ year: 'desc' }, { period: 'desc' }]
    });

    let latest = { housing: 0, pension: 0, medical: 0, unemployment: 0, annuity: 0 };

    if (lastRecord && lastRecord.year && lastRecord.period) {
      const latestWages = await prisma.wage.findMany({
        where: { year: lastRecord.year, period: lastRecord.period }
      });
      latestWages.forEach(w => {
        latest.housing += fmt(w.housingFund);
        latest.pension += fmt(w.pension);
        latest.medical += fmt(w.medicalInsurance);
        latest.unemployment += fmt(w.unemploymentIns);
        latest.annuity += fmt(w.corporateAnnuity);
      });
    }

    const monthlyTotal = (latest.housing * 2) + (latest.annuity * 5) + latest.pension + latest.medical + latest.unemployment;

    const data = {
      providentFundTotal: `¥${totalHousingFund.toLocaleString()}`,
      annuityTotal: `¥${totalAnnuity.toLocaleString()}`,
      monthlyContribution: `¥${monthlyTotal.toLocaleString()}`,
      // [新增] 下发结构化数值 DTO，替代前端正则解析
      raw: {
        providentFundTotal: totalHousingFund,
        annuityTotal: totalAnnuity
      },
      monthlyBreakdown: {
        provident: latest.housing * 2,
        annuity: latest.annuity * 5,
        pension: latest.pension
      },
      details: [
        {
          title: '住房公积金',
          icon: 'home_work',
          color: 'emerald',
          status: '正常缴纳',
          progress: 100,
          meta: { label: '月缴存额 (双边)', value: `¥${(latest.housing * 2).toLocaleString()}` }
        },
        {
          title: '企业年金',
          icon: 'savings',
          color: 'blue',
          status: '稳健增长',
          progress: 100,
          meta: { label: '个人账户余额', value: `¥${totalAnnuity.toLocaleString()}` }
        },
        {
          title: '基本社会保险',
          icon: 'medical_services',
          color: 'purple',
          status: '已参保',
          progress: 100,
          meta: { label: '个人月缴', value: `¥${(latest.pension + latest.medical + latest.unemployment).toLocaleString()}` }
        }
      ]
    };

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch benefits stats' });
  }
};