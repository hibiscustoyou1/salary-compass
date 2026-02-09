import { Request, Response } from 'express';
import { prisma } from '../db';
import { Decimal } from '@prisma/client/runtime/library';

// 辅助函数：将 Decimal 转为保留两位小数的字符串或数字
const fmt = (val: Decimal | null) => val ? val.toNumber() : 0;
const fmtStr = (val: Decimal | null) => val ? val.toFixed(2) : '0.00';

export const getSalaryHistory = async (req: Request, res: Response) => {
  try {
    // [修改] 排序逻辑：先按年倒序，再按月倒序
    const wages = await prisma.wage.findMany({
      orderBy: [
        { year: 'desc' },
        { period: 'desc' }
      ]
    });

    // 转换为前端需要的结构
    const history = wages.map(w => ({
      // [修改] 拼接期间字符串: 2024, 12 -> "2024-12"
      period: `${w.year}-${String(w.period).padStart(2, '0')}`,
      year: w.year,
      gross: fmtStr(w.grossTotal),
      deduction: fmtStr(w.deductionTotal),
      net: fmtStr(w.netTotal),
      status: '已发放',
      // 详情对象
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

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();

    const thisYearData = await prisma.wage.findMany({
      where: { year: currentYear }
    });

    let netIncomeYTD = 0;
    let taxPaidYTD = 0;
    let grossYTD = 0;

    thisYearData.forEach(w => {
      netIncomeYTD += fmt(w.netTotal);
      taxPaidYTD += fmt(w.taxAmount);
      grossYTD += fmt(w.grossTotal);
    });

    let variableIncome = 0;
    thisYearData.forEach(w => {
      variableIncome += fmt(w.meritPay) + fmt(w.quarterlyBonus) + fmt(w.annualBonus) + fmt(w.specialIncentive);
    });
    const variableRatio = grossYTD > 0 ? ((variableIncome / grossYTD) * 100).toFixed(1) + '%' : '0%';

    res.json({
      success: true,
      data: {
        netIncomeYTD: `¥${netIncomeYTD.toLocaleString()}`,
        taxPaid: `¥${taxPaidYTD.toLocaleString()}`,
        variableIncomeRatio: variableRatio,
        hiddenWealth: '¥45,000'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};

export const getBenefitsStats = async (req: Request, res: Response) => {
  try {
    const allWages = await prisma.wage.findMany();

    // 1. 计算累计资产 (估算逻辑)
    // 假设：公积金和年金企业均按 1:1 缴纳，所以个人扣款 * 2 = 总入账
    let totalHousingFund = 0;
    let totalAnnuity = 0;

    allWages.forEach(w => {
      totalHousingFund += fmt(w.housingFund) * 2;
      totalAnnuity += fmt(w.corporateAnnuity) * 2;
    });

    // 2. 获取最近一个月的缴纳详情
    const lastWage = await prisma.wage.findFirst({
      orderBy: [
        { year: 'desc' },
        { period: 'desc' }
      ]
    });

    const latest = lastWage ? {
      housing: fmt(lastWage.housingFund),
      pension: fmt(lastWage.pension),
      medical: fmt(lastWage.medicalInsurance),
      unemployment: fmt(lastWage.unemploymentIns),
      annuity: fmt(lastWage.corporateAnnuity)
    } : { housing: 0, pension: 0, medical: 0, unemployment: 0, annuity: 0 };

    // 计算月度总缴存 (个人+企业)
    // 假设五险一金中，只有公积金和年金是 1:1 进个人账户，社保企业部分进统筹（此处仅展示个人账户相关或缴存规模）
    // 为了展示“月度福利缴纳”这个 KPI，我们计算所有福利项的个人+企业总和
    // 简单估算：养老(8%+16%), 医疗(2%+8%), 失业(0.5%+0.5%), 公积金(12%+12%), 年金(4%+4%)
    // 这里简化处理：显示 个人扣款总额 * 2 作为估算的月度福利投入规模
    const monthlyTotal = (latest.housing + latest.pension + latest.medical + latest.unemployment + latest.annuity) * 2;

    const data = {
      providentFundTotal: `¥${totalHousingFund.toLocaleString()}`,
      annuityTotal: `¥${totalAnnuity.toLocaleString()}`,
      monthlyContribution: `¥${monthlyTotal.toLocaleString()}`,
      // 详情列表
      details: [
        {
          title: '住房公积金',
          icon: 'home_work', // Material Icon
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