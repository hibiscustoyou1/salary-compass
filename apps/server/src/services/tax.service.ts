import { DashboardRepository } from '@/repositories/dashboard.repository';

export const TaxService = {
  async getAnalysis() {
    const currentYear = new Date().getFullYear();
    const records = await DashboardRepository.findByYear(currentYear);

    // 1. 累计税额 & 总收入
    let totalTax = 0;
    let totalGross = 0;
    let cumulativeRent = 0;
    let cumulativeChild = 0;

    // 构造图表数据
    const months = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
    const cumulativeIncomeData = new Array(12).fill(0);
    const monthlyTaxData = new Array(12).fill(0);

    let runningIncome = 0;

    records.forEach(r => {
      totalTax += (r.currentTax || 0);
      totalGross += (r.grossTotal || 0);

      // 取最后一条的累计扣除额作为年度总额
      if (r.month === records.length) { // 简单逻辑，或者每次覆盖
        cumulativeRent = r.cumulativeRentDeduction || 0;
        cumulativeChild = r.cumulativeChildCareDeduction || 0;
      }
      cumulativeRent = Math.max(cumulativeRent, r.cumulativeRentDeduction || 0);
      cumulativeChild = Math.max(cumulativeChild, r.cumulativeChildCareDeduction || 0);

      // 图表数据
      if (r.month >= 1 && r.month <= 12) {
        // 估算应纳税所得额 (简化算法：Gross - 5000 - 社保公积金 - 专项扣除)
        // 这里为了展示趋势，直接累加 Gross 也可以，或者更精细一点
        // 假设每月社保公积金扣除 approx 18%
        // runningIncome += (r.grossTotal || 0) * 0.8;
        // 最简单的：直接用 Gross 展示跳档趋势
        runningIncome += (r.grossTotal || 0);

        cumulativeIncomeData[r.month - 1] = runningIncome;
        monthlyTaxData[r.month - 1] = (r.currentTax || 0);
      }
    });

    const effectiveRate = totalGross > 0 ? (totalTax / totalGross) * 100 : 0;
    const totalDeduction = cumulativeRent + cumulativeChild;
    const estimatedTaxSaved = totalDeduction * 0.1; // 估算 10%

    return {
      cards: {
        totalTax,
        effectiveRate: parseFloat(effectiveRate.toFixed(1)),
        taxSaved: estimatedTaxSaved
      },
      chart: {
        months,
        cumulativeIncome: cumulativeIncomeData,
        monthlyTax: monthlyTaxData
      },
      deductionStructure: [
        { name: '住房租金', value: cumulativeRent },
        { name: '婴幼儿照护', value: cumulativeChild }
      ]
    };
  }
};