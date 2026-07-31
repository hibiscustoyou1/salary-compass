import { Request, Response } from 'express';
import { prisma } from '@/db';
import { Decimal } from '@prisma/client/runtime/library';

// 辅助函数
const fmt = (val: Decimal | null | undefined | number) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  return val.toNumber();
};
const fmtStr = (val: number) => val.toFixed(2);

// 聚合逻辑 (保留)
const mergeRecords = (target: any, source: any) => {
  target.grossTotal += fmt(source.grossTotal);
  target.deductionTotal += fmt(source.deductionTotal);
  target.netTotal += fmt(source.netTotal);
  target.taxAmount += fmt(source.taxAmount);

  // 累加收入
  target.baseSalary += fmt(source.baseSalary);
  target.meritPay += fmt(source.meritPay);
  target.subsidy += fmt(source.subsidy);
  target.talentBonus += fmt(source.talentBonus);
  target.quarterlyBonus += fmt(source.quarterlyBonus);
  target.annualBonus += fmt(source.annualBonus);
  target.heatSubsidy += fmt(source.heatSubsidy);
  target.specialIncentive += fmt(source.specialIncentive);
  target.otherWage += fmt(source.otherWage);
  target.mealAllowance += fmt(source.mealAllowance);

  // 累加扣除
  target.pension += fmt(source.pension);
  target.medicalInsurance += fmt(source.medicalInsurance);
  target.unemploymentIns += fmt(source.unemploymentIns);
  target.housingFund += fmt(source.housingFund);
  target.corporateAnnuity += fmt(source.corporateAnnuity);
  target.unionFee += fmt(source.unionFee);

  // [新增] 专项附加扣除 (累计值，取最大)
  // 注意：因为是"累计"字段，同一年度内后面的月份通常包含了前面的累计额
  // 这里为了严谨，我们取 Math.max，确保在聚合视图（如按年聚合）时能拿到该年度的最终累计额
  target.rentDeduction = Math.max(target.rentDeduction || 0, fmt(source.rentDeduction));
  target.childCareDeduction = Math.max(target.childCareDeduction || 0, fmt(source.childCareDeduction));

  if (source.payoutDate && (!target.payoutDate || source.payoutDate > target.payoutDate)) {
    target.payoutDate = source.payoutDate;
  }
};

export const getSalaryHistory = async (req: Request, res: Response) => {
  try {
    const rawWages = await prisma.wage.findMany({
      orderBy: [{ year: 'desc' }, { period: 'desc' }]
    });

    const groupedMap = new Map<string, any>();

    for (const w of rawWages) {
      if (!w.year || !w.period) continue;
      const key = `${w.year}-${w.period}`;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          year: w.year,
          period: w.period,
          payoutDate: w.payoutDate,
          grossTotal: fmt(w.grossTotal),
          deductionTotal: fmt(w.deductionTotal),
          netTotal: fmt(w.netTotal),
          taxAmount: fmt(w.taxAmount),
          baseSalary: fmt(w.baseSalary),
          meritPay: fmt(w.meritPay),
          subsidy: fmt(w.subsidy),
          talentBonus: fmt(w.talentBonus),
          quarterlyBonus: fmt(w.quarterlyBonus),
          annualBonus: fmt(w.annualBonus),
          heatSubsidy: fmt(w.heatSubsidy),
          specialIncentive: fmt(w.specialIncentive),
          otherWage: fmt(w.otherWage),
          mealAllowance: fmt(w.mealAllowance),
          pension: fmt(w.pension),
          medicalInsurance: fmt(w.medicalInsurance),
          unemploymentIns: fmt(w.unemploymentIns),
          housingFund: fmt(w.housingFund),
          corporateAnnuity: fmt(w.corporateAnnuity),
          unionFee: fmt(w.unionFee),
          // [新增] 专项附加扣除
          rentDeduction: fmt(w.rentDeduction),
          childCareDeduction: fmt(w.childCareDeduction)
        });
      } else {
        mergeRecords(groupedMap.get(key), w);
      }
    }

    const history = Array.from(groupedMap.values()).map(w => ({
      period: `${w.year}-${String(w.period).padStart(2, '0')}`,
      year: w.year,
      gross: fmtStr(w.grossTotal),
      deduction: fmtStr(w.deductionTotal),
      net: fmtStr(w.netTotal),
      status: '已发放',
      details: {
        income: {
          baseSalary: fmtStr(w.baseSalary),
          meritPay: fmtStr(w.meritPay),
          subsidy: fmtStr(w.subsidy),
          talentBonus: fmtStr(w.talentBonus),
          quarterlyBonus: fmtStr(w.quarterlyBonus),
          annualBonus: fmtStr(w.annualBonus),
          heatSubsidy: fmtStr(w.heatSubsidy),
          specialIncentive: fmtStr(w.specialIncentive),
          otherWage: fmtStr(w.otherWage),
          mealAllowance: fmtStr(w.mealAllowance)
        } as Record<string, string>,
        deductions: {
          pension: fmtStr(w.pension),
          medicalInsurance: fmtStr(w.medicalInsurance),
          unemploymentIns: fmtStr(w.unemploymentIns),
          housingFund: fmtStr(w.housingFund),
          corporateAnnuity: fmtStr(w.corporateAnnuity),
          unionFee: fmtStr(w.unionFee),
          taxAmount: fmtStr(w.taxAmount),
          // [新增] 专项附加扣除
          rentDeduction: fmtStr(w.rentDeduction),
          childCareDeduction: fmtStr(w.childCareDeduction)
        } as Record<string, string>
      },
      raw: {
        net: w.netTotal,
        gross: w.grossTotal,
        tax: w.taxAmount
      }
    }));

    history.forEach(item => {
      item.details.income = Object.fromEntries(
        Object.entries(item.details.income).filter(([_, v]) => v !== '0.00')
      );
      item.details.deductions = Object.fromEntries(
        Object.entries(item.details.deductions).filter(([_, v]) => v !== '0.00')
      );
    });

    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Fetch salary error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch salary records' });
  }
};