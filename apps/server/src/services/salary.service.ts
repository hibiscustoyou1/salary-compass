import { SalaryRepository } from '@/repositories/salary.repository';

export const SalaryService = {
  // 列表页数据清洗
  async getList(page: number, pageSize: number) {
    const { total, items } = await SalaryRepository.findAll(page, pageSize);

    return {
      total,
      list: items.map(item => ({
        key: `${item.year}-${item.month}`, // 前端唯一Key
        year: item.year,
        month: item.month,
        period: `${item.year}-${String(item.month).padStart(2, '0')}`,
        gross: item.grossTotal || 0,
        deduction: item.deductionTotal || 0,
        net: item.netPay || 0,
        status: 'published' // 默认已发放
      }))
    };
  },

  // 详情页数据组装
  async getDetail(year: number, month: number) {
    const record = await SalaryRepository.findByPeriod(year, month);
    if (!record) throw new Error('未找到该月薪资记录');

    const periodStr = `${record.year}-${String(record.month).padStart(2, '0')}`;

    // 简单处理日期
    let paymentDateStr = periodStr + "-15";
    if (record.paymentDate) {
      // 如果数据库存的是 "2024-05-10" 这种格式直接用
      // 如果不是，可以做简单处理
      paymentDateStr = record.paymentDate;
    }

    return {
      month: periodStr,
      paymentDate: paymentDateStr,
      grossTotal: record.grossTotal || 0,
      netTotal: record.netPay || 0,

      // 动态组装收入项 (过滤掉 0 值)
      incomes: {
        '岗位工资': record.baseSalary,
        '月度绩效': record.monthlyPerformance,
        '综合补贴': record.subsidy,
        '其他工资': record.otherSalary,
        '人才特区奖金': record.talentBonus,
        '季度奖金': record.quarterlyBonus,
        '年度奖金': record.annualBonus,
        '专项激励': record.specialIncentive,
        '防暑降温': record.heatAllowance,
        '伙食补贴': record.mealAllowance
      },

      // 扣除项
      deductions: {
        pension: record.pensionPersonal || 0,
        medical: record.medicalPersonal || 0,
        unemployment: record.unemploymentPersonal || 0,
        fund: record.housingFundPersonal || 0,
        annuity: record.annuityPersonal || 0,
        tax: record.currentTax || 0,
        union: record.unionFee || 0
      }
    };
  }
};