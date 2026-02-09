import { Request, Response } from 'express';
import { prisma } from '../db';
import { Decimal } from '@prisma/client/runtime/library';

// --- 辅助函数 ---
// 安全转换 Prisma Decimal 为 Number，处理 null/undefined
const fmt = (val: Decimal | null | undefined | number) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  return val.toNumber();
};

// 格式化金额字符串
const fmtStr = (val: number) => val.toFixed(2);

// [核心] 聚合记录：将 source 的金额累加到 target
const mergeRecords = (target: any, source: any) => {
  // 1. 基础金额累加
  target.grossTotal += fmt(source.grossTotal);
  target.deductionTotal += fmt(source.deductionTotal);
  target.netTotal += fmt(source.netTotal);
  target.taxAmount += fmt(source.taxAmount);

  // 2. 收入明细累加
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

  // 3. 扣除明细累加
  target.pension += fmt(source.pension);
  target.medicalInsurance += fmt(source.medicalInsurance);
  target.unemploymentIns += fmt(source.unemploymentIns);
  target.housingFund += fmt(source.housingFund);
  target.corporateAnnuity += fmt(source.corporateAnnuity);
  target.unionFee += fmt(source.unionFee);

  // 4. 日期更新：保留该月最后一次发放的日期
  if (source.payoutDate && (!target.payoutDate || source.payoutDate > target.payoutDate)) {
    target.payoutDate = source.payoutDate;
  }
};

// ==========================================
// 1. 获取薪资历史列表 (含合并逻辑)
// ==========================================
export const getSalaryHistory = async (req: Request, res: Response) => {
  try {
    // 拉取全量数据
    const rawWages = await prisma.wage.findMany({
      orderBy: [
        { year: 'desc' },
        { period: 'desc' }
      ]
    });

    // 内存聚合 Map: Key = "2024-1"
    const groupedMap = new Map<string, any>();

    for (const w of rawWages) {
      // 容错处理：若年份或期间缺失，跳过
      if (!w.year || !w.period) continue;

      const key = `${w.year}-${w.period}`;

      if (!groupedMap.has(key)) {
        // 初始化累加对象
        // 注意：这里将 BigInt ID 忽略，因为聚合后 ID 无意义且不好序列化
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
        // 合并多条记录（如同一个月有工资+奖金）
        mergeRecords(groupedMap.get(key), w);
      }
    }

    // 转换为前端视图模型
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

    // 过滤金额为 0 的明细项
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

// ==========================================
// 2. 获取仪表盘统计数据 (含资产积累 & 同比)
// ==========================================
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const queryYear = Number(req.query.year);
    const targetYear = isNaN(queryYear) ? new Date().getFullYear() : queryYear;

    // 获取本年数据
    const thisYearData = await prisma.wage.findMany({
      where: { year: targetYear }
    });

    // 获取去年数据 (用于同比)
    const lastYearData = await prisma.wage.findMany({
      where: { year: targetYear - 1 }
    });

    // 获取全量数据 (用于公积金/年金积累)
    const allTimeData = await prisma.wage.findMany({
      select: { housingFund: true, corporateAnnuity: true }
    });

    // --- 计算年度 KPI ---
    let netIncomeYTD = 0;
    let taxPaidYTD = 0;

    thisYearData.forEach(w => {
      netIncomeYTD += fmt(w.netTotal);
      taxPaidYTD += fmt(w.taxAmount);
    });

    // --- 计算同比 ---
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

    // --- 计算全量资产积累 (Task 3 规则) ---
    let providentFundAccumulated = 0;
    let annuityAccumulated = 0;

    allTimeData.forEach(w => {
      // 规则：公积金 = 个人部分 * 2 (1:1配比)
      providentFundAccumulated += fmt(w.housingFund) * 2;
      // 规则：企业年金 = 个人部分 * 5 (1:4配比)
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
    console.error('Stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};

// ==========================================
// 3. 获取福利统计数据 (含最新月合并逻辑)
// ==========================================
export const getBenefitsStats = async (req: Request, res: Response) => {
  try {
    const allWages = await prisma.wage.findMany();
    let totalHousingFund = 0;
    let totalAnnuity = 0;

    // 计算全量福利池 (注意：Benefits 页面保持 *2 或更新为 *5，此处暂保持 *2)
    allWages.forEach(w => {
      totalHousingFund += fmt(w.housingFund) * 2;
      totalAnnuity += fmt(w.corporateAnnuity) * 2;
    });

    // 获取最新月份的合并数据
    // 1. 找到数据库中最新的年份和月份
    const lastRecord = await prisma.wage.findFirst({
      orderBy: [{ year: 'desc' }, { period: 'desc' }]
    });

    let latest = {
      housing: 0,
      pension: 0,
      medical: 0,
      unemployment: 0,
      annuity: 0
    };

    if (lastRecord && lastRecord.year && lastRecord.period) {
      // 2. 查找该年月的所有记录 (可能有多条)
      const latestWages = await prisma.wage.findMany({
        where: { year: lastRecord.year, period: lastRecord.period }
      });

      // 3. 聚合计算
      latestWages.forEach(w => {
        latest.housing += fmt(w.housingFund);
        latest.pension += fmt(w.pension);
        latest.medical += fmt(w.medicalInsurance);
        latest.unemployment += fmt(w.unemploymentIns);
        latest.annuity += fmt(w.corporateAnnuity);
      });
    }

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