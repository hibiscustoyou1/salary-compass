import { Request, Response } from 'express';
import { prisma } from '../db';
import { Decimal } from '@prisma/client/runtime/library';

// 辅助函数
const fmt = (val: Decimal | null) => val ? val.toNumber() : 0;
const fmtStr = (val: Decimal | null) => val ? val.toFixed(2) : '0.00';

// 1. 获取薪资历史列表
export const getSalaryHistory = async (req: Request, res: Response) => {
  try {
    const wages = await prisma.wage.findMany({
      orderBy: [
        { year: 'desc' },
        { period: 'desc' }
      ]
    });

    const history = wages.map(w => ({
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
        net: fmt(w.netTotal),
        gross: fmt(w.grossTotal),
        tax: fmt(w.taxAmount)
      }
    }));

    // 过滤掉金额为 0 的项
    history.forEach(item => {
      item.details.income = Object.fromEntries(Object.entries(item.details.income).filter(([_, v]) => v !== '0.00'));
      item.details.deductions = Object.fromEntries(Object.entries(item.details.deductions).filter(([_, v]) => v !== '0.00'));
    });

    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Fetch salary error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch salary records' });
  }
};

// 2. 获取仪表盘统计数据 (含同比计算)
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const queryYear = Number(req.query.year);
    const targetYear = isNaN(queryYear) ? new Date().getFullYear() : queryYear;

    // 获取本年数据
    const thisYearData = await prisma.wage.findMany({
      where: { year: targetYear }
    });

    // [新增] 获取去年数据用于计算同比
    const lastYearData = await prisma.wage.findMany({
      where: { year: targetYear - 1 }
    });

    // 计算本年 KPI
    let netIncomeYTD = 0;
    let taxPaidYTD = 0;
    let grossYTD = 0;
    let variableIncome = 0;

    thisYearData.forEach(w => {
      netIncomeYTD += fmt(w.netTotal);
      taxPaidYTD += fmt(w.taxAmount);
      grossYTD += fmt(w.grossTotal);
      variableIncome += fmt(w.meritPay) + fmt(w.quarterlyBonus) + fmt(w.annualBonus) + fmt(w.specialIncentive);
    });

    // [新增] 计算去年 KPI 及同比
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
      netIncomeChange = '+100%'; // 去年无数据，今年有数据
    }

    const variableRatio = grossYTD > 0 ? ((variableIncome / grossYTD) * 100).toFixed(1) + '%' : '0%';

    res.json({
      success: true,
      data: {
        netIncomeYTD: `¥${netIncomeYTD.toLocaleString()}`,
        netIncomeChange, // [新增返回字段]
        taxPaid: `¥${taxPaidYTD.toLocaleString()}`,
        variableIncomeRatio: variableRatio,
        hiddenWealth: '¥45,000'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};

// 3. 获取福利统计数据
export const getBenefitsStats = async (req: Request, res: Response) => {
  try {
    const allWages = await prisma.wage.findMany();
    let totalHousingFund = 0;
    let totalAnnuity = 0;

    allWages.forEach(w => {
      totalHousingFund += fmt(w.housingFund) * 2;
      totalAnnuity += fmt(w.corporateAnnuity) * 2;
    });

    const lastWage = await prisma.wage.findFirst({
      orderBy: [{ year: 'desc' }, { period: 'desc' }]
    });

    const latest = lastWage ? {
      housing: fmt(lastWage.housingFund),
      pension: fmt(lastWage.pension),
      medical: fmt(lastWage.medicalInsurance),
      unemployment: fmt(lastWage.unemploymentIns),
      annuity: fmt(lastWage.corporateAnnuity)
    } : { housing: 0, pension: 0, medical: 0, unemployment: 0, annuity: 0 };

    const monthlyTotal = (latest.housing + latest.pension + latest.medical + latest.unemployment + latest.annuity) * 2;

    const data = {
      providentFundTotal: `¥${totalHousingFund.toLocaleString()}`,
      annuityTotal: `¥${totalAnnuity.toLocaleString()}`,
      monthlyContribution: `¥${monthlyTotal.toLocaleString()}`,
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
    console.error('Benefits stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch benefits stats' });
  }
};