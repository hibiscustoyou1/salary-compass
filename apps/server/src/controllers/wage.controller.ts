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
          unionFee: fmt(w.unionFee)
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
          '岗位工资': fmtStr(w.baseSalary),
          '月度绩效': fmtStr(w.meritPay),
          '综合补贴': fmtStr(w.subsidy),
          '人才特区奖金': fmtStr(w.talentBonus),
          '季度绩效': fmtStr(w.quarterlyBonus),
          '年度绩效': fmtStr(w.annualBonus),
          '防暑降温': fmtStr(w.heatSubsidy),
          '专项激励': fmtStr(w.specialIncentive),
          '其他工资': fmtStr(w.otherWage),
          '伙食补贴': fmtStr(w.mealAllowance)
        },
        deductions: {
          '基本养老': fmtStr(w.pension),
          '基本医疗': fmtStr(w.medicalInsurance),
          '失业保险': fmtStr(w.unemploymentIns),
          '住房公积金': fmtStr(w.housingFund),
          '企业年金': fmtStr(w.corporateAnnuity),
          '工会费': fmtStr(w.unionFee),
          '个人所得税': fmtStr(w.taxAmount)
        }
      },
      raw: {
        net: w.netTotal,
        gross: w.grossTotal,
        tax: w.taxAmount
      }
    }));

    // [修复 TS2740] 使用类型断言规避 Object.fromEntries 类型不匹配警告
    history.forEach(item => {
      item.details.income = Object.fromEntries(
        Object.entries(item.details.income).filter(([_, v]) => v !== '0.00')
      ) as any;
      item.details.deductions = Object.fromEntries(
        Object.entries(item.details.deductions).filter(([_, v]) => v !== '0.00')
      ) as any;
    });

    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Fetch salary error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch salary records' });
  }
};