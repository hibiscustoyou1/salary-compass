import { DashboardRepository } from '@/repositories/dashboard.repository';

export const DashboardService = {
  // 无需任何参数，直接获取当前用户的概览
  async getOverview() {
    const currentYear = new Date().getFullYear();

    // 1. 获取数据
    const records = await DashboardRepository.findByYear(currentYear);
    const latest = await DashboardRepository.findLatest();

    // 2. 初始化聚合变量
    let totalGross = 0;
    let totalNet = 0;
    let totalTax = 0;
    let totalBonus = 0;
    let totalFixed = 0;
    let totalHiddenWealth = 0;

    // 趋势图数组 (1-12月)
    const trendGross = new Array(12).fill(0);
    const trendNet = new Array(12).fill(0);

    // 3. 遍历计算
    records.forEach(r => {
      const gross = r.grossTotal || 0;
      const net = r.netPay || 0;
      const tax = r.currentTax || 0;

      totalGross += gross;
      totalNet += net;
      totalTax += tax;

      // 奖金 = 绩效 + 季度 + 年度 + 人才 + 专项
      const bonus = (r.monthlyPerformance || 0) + (r.quarterlyBonus || 0) +
        (r.annualBonus || 0) + (r.talentBonus || 0) + (r.specialIncentive || 0);
      // 固定 = 岗位 + 补贴
      const fixed = (r.baseSalary || 0) + (r.subsidy || 0);

      totalBonus += bonus;
      totalFixed += fixed;

      // 隐形财富 (公积金+年金+医保) * 2 (假设企业1:1)
      const personalBenefits = (r.housingFundPersonal || 0) + (r.annuityPersonal || 0) + (r.medicalPersonal || 0);
      totalHiddenWealth += (personalBenefits * 2);

      // 填充趋势图
      if (r.month >= 1 && r.month <= 12) {
        trendGross[r.month - 1] = gross;
        trendNet[r.month - 1] = net;
      }
    });

    // 4. 计算比率
    const variableRatio = totalGross > 0 ? Math.round((totalBonus / totalGross) * 100) : 0;

    // 5. 构建现金流 (月均)
    const count = records.length || 1;
    const cashFlow = {
      gross: totalGross / count,
      tax: totalTax / count,
      pension: records.reduce((sum, r) => sum + (r.pensionPersonal || 0), 0) / count,
      housing: records.reduce((sum, r) => sum + (r.housingFundPersonal || 0), 0) / count,
      net: totalNet / count
    };

    return {
      cards: {
        netIncome: totalNet,
        taxPaid: totalTax,
        hiddenWealth: totalHiddenWealth,
        variableRatio: variableRatio
      },
      charts: {
        trend: {
          categories: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
          gross: trendGross,
          net: trendNet
        },
        structure: {
          fixed: totalFixed,
          bonus: totalBonus,
          rsu: 0
        },
        cashFlow: cashFlow
      }
    };
  }
};