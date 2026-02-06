export interface SalaryRecord {
  period: string;
  gross: string;
  deduction: string;
  net: string;
  details: {
    income: Record<string, string>;
    deductions: Record<string, string>;
  };
}

// 模拟生成 2015-2024 的薪资历史
export const generateSalaryHistory = (): SalaryRecord[] => {
  const baseHistory: SalaryRecord[] = [
    {
      period: '2024-06', gross: '¥35,000.00', deduction: '10,700.00', net: '¥24,300.00',
      details: { income: {}, deductions: {} }
    },
    {
      period: '2024-05', gross: '¥35,000.00', deduction: '10,700.00', net: '¥24,300.00',
      details: {
        income: { '岗位工资': '¥20,000.00', '月度绩效': '¥8,000.00', '人才特区奖金': '¥5,000.00', '综合补贴': '¥2,000.00' },
        deductions: { '社保及个税': '5,500.00', '企业年金': '1,200.00', '住房公积金': '4,000.00' }
      }
    },
    // ... 更多静态数据可以按需补充
  ];

  // 简单补全代码，模拟更多数据
  for (let year = 2024; year >= 2023; year--) {
    const startMonth = year === 2024 ? 4 : 12;
    for (let month = startMonth; month >= 1; month--) {
      const monthStr = month.toString().padStart(2, '0');
      baseHistory.push({
        period: `${year}-${monthStr}`,
        gross: `¥34,500.00`,
        deduction: '10,500.00',
        net: `¥24,000.00`,
        details: { income: {}, deductions: {} }
      });
    }
  }
  return baseHistory;
};

export const KPI_DATA = {
  netIncomeYTD: { value: '¥142,500', trend: '+12%' },
  taxPaid: { value: '¥68,200', rate: '32%' },
  hiddenWealth: { value: '¥45,000', trend: '+5%' },
  variableIncomeRatio: { value: '25%', target: '30%' }
};

export const INCOME_STRUCTURE = [
  { label: '固定薪资', value: '¥180,000', percent: '65%', colorClass: 'bg-[#1241a1]' },
  { label: '绩效奖金', value: '¥65,000', percent: '25%', colorClass: 'bg-blue-400' },
  { label: '专项激励 (RSU)', value: '¥35,000', percent: '10%', colorClass: 'bg-[#10b981]' }
];

// ... existing code ...

export const TAX_BRACKETS = [
  { limit: 36000, rate: 3, label: '3% 起征点' },
  { limit: 144000, rate: 10, label: '10% 阶梯' },
  { limit: 300000, rate: 20, label: '20% 阶梯' },
  { limit: 420000, rate: 25, label: '25% 阶梯' },
  { limit: 660000, rate: 30, label: '30% 阶梯' },
  { limit: 960000, rate: 35, label: '35% 阶梯' },
];

export const getTaxAnalysisData = () => {
  // 模拟1-12月的累计应纳税所得额增长
  const months = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
  const monthlyIncome = 28000; // 假设月均应纳税所得

  const data = months.map((month, index) => {
    const accumulated = monthlyIncome * (index + 1);
    // 简单估算税率档位
    let rate = 3;
    if (accumulated > 960000) rate = 45;
    else if (accumulated > 660000) rate = 35;
    else if (accumulated > 420000) rate = 30;
    else if (accumulated > 300000) rate = 25;
    else if (accumulated > 144000) rate = 20;
    else if (accumulated > 36000) rate = 10;

    return {
      month,
      accumulated,
      currentRate: rate
    };
  });

  return {
    trend: data,
    kpi: {
      totalTax: '¥12,450',
      totalTaxTrend: '+4.2%',
      effectiveRate: 8.5,
      deductionSavings: '¥24,000'
    },
    suggestions: [
      { type: 'warning', text: '预计将在 10月 触达 20% 税率档位。' },
      { type: 'success', text: '建议将 年终奖 调整至次年1月发放以优化税负。' }
    ]
  };
};

// ... existing code ...

export const BENEFITS_DATA = {
  providentFundTotal: 5800000, // 模拟公积金当前估值
  monthlyContribution: 4700,   // 月缴存
  details: [
    {
      title: '基本医疗保险',
      icon: 'medical_services',
      color: 'blue', // 对应 tailwind class: text-blue-xxx, bg-blue-xxx
      status: '正常',
      progress: 100,
      meta: { label: '缴纳比例', value: '企业 8% / 个人 2%' }
    },
    {
      title: '失业保险',
      icon: 'umbrella',
      color: 'orange',
      status: '累计 86 个月',
      progress: 85,
      meta: { label: '当前覆盖率', value: '85%' }
    },
    {
      title: '工伤与生育',
      icon: 'health_and_safety',
      color: 'purple',
      status: '顶级覆盖',
      progress: 100,
      meta: { label: '费用承担', value: '企业全额承担' }
    }
  ]
};
