import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getSalaryHistory, type SalaryRecord } from '@/api/wage';
import { getDashboardStats, type DashboardStats } from '@/api/dashboard';
import { getBenefitsStats, type BenefitsStats } from '@/api/benefits';

export const useWageStore = defineStore('wage', () => {
  // --- State ---
  const salaryHistory = ref<SalaryRecord[]>([]);
  const dashboardStats = ref<DashboardStats>({
    netIncomeYTD: '¥0',
    taxPaid: '¥0',
    variableIncomeRatio: '0%',
    hiddenWealth: '¥0'
  });
  // [新增] 福利数据 State
  const benefitsStats = ref<BenefitsStats>({
    providentFundTotal: '¥0',
    annuityTotal: '¥0',
    monthlyContribution: '¥0',
    details: []
  });

  const isLoading = ref(false);
  const isInitialized = ref(false);

  // --- Actions ---
  const initData = async () => {
    if (isInitialized.value) return;
    isLoading.value = true;
    try {
      // [修改] 并行请求 3 个接口
      const [historyRes, statsRes, benefitsRes] = await Promise.all([
        getSalaryHistory(),
        getDashboardStats(),
        getBenefitsStats()
      ]);

      if (historyRes.success) salaryHistory.value = historyRes.data;
      if (statsRes.success) dashboardStats.value = statsRes.data;
      // [新增]
      if (benefitsRes.success) benefitsStats.value = benefitsRes.data;

      isInitialized.value = true;
    } catch (e) {
      console.error('Failed to init data', e);
    } finally {
      isLoading.value = false;
    }
  };

  // --- Getters (保持不变) ---
  const taxAnalysis = computed(() => {
    // ... (省略原有逻辑) ...
    // 这里为了完整性建议保留之前的代码
    const currentYear = new Date().getFullYear();
    const thisYearRecords = salaryHistory.value
      .filter(r => r.year === currentYear)
      .sort((a, b) => a.period.localeCompare(b.period));

    // ... (复制之前的 taxAnalysis 逻辑) ...
    const trend = thisYearRecords.map(record => {
      const monthStr = record.period.split('-')[1] + '月';
      return { month: monthStr, accumulated: record.raw.gross, currentRate: 0 };
    });

    let acc = 0;
    const finalTrend = trend.map(item => {
      acc += item.accumulated;
      return { month: item.month, accumulated: acc, currentRate: 10 }; // 简化展示
    });

    const totalTaxVal = thisYearRecords.reduce((sum, r) => sum + r.raw.tax, 0);
    return {
      trend: finalTrend,
      kpi: { totalTax: `¥${totalTaxVal.toLocaleString()}`, totalTaxTrend: '+0%', effectiveRate: '0.0', deductionSavings: '¥0' }
    };
  });

  // --- Getters: Income Structure (NEW) ---
  const incomeStructure = computed(() => {
    const currentYear = new Date().getFullYear();
    const thisYearRecords = salaryHistory.value.filter(r => r.year === currentYear);

    // 初始化累加器
    let fixed = 0;       // 固定薪资
    let performance = 0; // 绩效奖金
    let special = 0;     // 专项激励
    let total = 0;

    // 辅助解析函数
    const parse = (val: string | undefined) => parseFloat(val || '0');

    thisYearRecords.forEach(record => {
      const inc = record.details.income;

      // 1. 固定薪资组
      const f = parse(inc['岗位工资']) + parse(inc['综合补贴']) + parse(inc['其他工资']) + parse(inc['伙食补贴']) + parse(inc['防暑降温']);
      fixed += f;

      // 2. 绩效奖金组
      const p = parse(inc['月度绩效']) + parse(inc['季度绩效']) + parse(inc['年度绩效']);
      performance += p;

      // 3. 专项激励组
      const s = parse(inc['人才特区奖金']) + parse(inc['专项激励']);
      special += s;

      total += (f + p + s);
    });

    // 避免除以零
    const safeTotal = total || 1;

    // 格式化输出
    return [
      {
        label: '固定薪资',
        value: `¥${fixed.toLocaleString()}`,
        percent: ((fixed / safeTotal) * 100).toFixed(1) + '%',
        colorText: 'text-primary',
        colorClass: 'bg-primary'
      },
      {
        label: '绩效奖金',
        value: `¥${performance.toLocaleString()}`,
        percent: ((performance / safeTotal) * 100).toFixed(1) + '%',
        colorText: 'text-blue-400',
        colorClass: 'bg-blue-400'
      },
      {
        label: '专项激励',
        value: `¥${special.toLocaleString()}`,
        percent: ((special / safeTotal) * 100).toFixed(1) + '%',
        colorText: 'text-emerald-custom',
        colorClass: 'bg-emerald-custom'
      }
    ];
  });

  // 辅助 Getter: 年度总薪酬
  const totalAnnualGross = computed(() => {
    const currentYear = new Date().getFullYear();
    const total = salaryHistory.value
      .filter(r => r.year === currentYear)
      .reduce((sum, r) => sum + r.raw.gross, 0);
    return `¥${total.toLocaleString()}`;
  });

  return {
    salaryHistory,
    dashboardStats,
    benefitsStats,
    isLoading,
    initData,
    taxAnalysis,
    incomeStructure, // 导出新 Getter
    totalAnnualGross // 导出年度总额
  };
});