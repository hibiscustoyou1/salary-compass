import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getSalaryHistory, type SalaryRecord } from '@/api/wage';
import { getDashboardStats, type DashboardStats } from '@/api/dashboard';
import { getBenefitsStats, type BenefitsStats } from '@/api/benefits';

export const useWageStore = defineStore('wage', () => {
  // --- State ---
  const salaryHistory = ref<SalaryRecord[]>([]);
  const dashboardYear = ref(new Date().getFullYear());

  const dashboardStats = ref<DashboardStats>({
    netIncomeYTD: '¥0',
    netIncomeChange: '+0%', // [新增]
    taxPaid: '¥0',
    variableIncomeRatio: '0%',
    hiddenWealth: '¥0'
  });

  const benefitsStats = ref<BenefitsStats>({
    providentFundTotal: '¥0',
    annuityTotal: '¥0',
    monthlyContribution: '¥0',
    details: []
  });

  const isLoading = ref(false);
  const isInitialized = ref(false);

  // --- Getters ---
  const availableYears = computed(() => {
    const years = new Set(salaryHistory.value.map(item => item.year));
    return Array.from(years).sort((a, b) => b - a);
  });

  // [新增] 净收入迷你图数据 (Sparkline)
  // 逻辑：筛选当前 Dashboard 年份的数据 -> 按月份正序排列 -> 提取净收入数值
  const netIncomeMiniChartData = computed(() => {
    const targetYear = dashboardYear.value;
    return salaryHistory.value
      .filter(r => r.year === targetYear)
      .sort((a, b) => a.period.localeCompare(b.period)) // 字符串比较: "2024-01" < "2024-02"
      .map(r => r.raw.net);
  });

  // --- Actions ---
  const initData = async () => {
    if (isInitialized.value) return;
    isLoading.value = true;
    try {
      const [historyRes, statsRes, benefitsRes] = await Promise.all([
        getSalaryHistory(),
        getDashboardStats(dashboardYear.value),
        getBenefitsStats()
      ]);

      if (historyRes.success) salaryHistory.value = historyRes.data;
      if (statsRes.success) dashboardStats.value = statsRes.data;
      if (benefitsRes.success) benefitsStats.value = benefitsRes.data;

      const hasCurrentYear = historyRes.data.some(r => r.year === dashboardYear.value);
      if (!hasCurrentYear && historyRes.data.length > 0) {
        dashboardYear.value = historyRes.data[0].year;
        const retryStats = await getDashboardStats(dashboardYear.value);
        if (retryStats.success) dashboardStats.value = retryStats.data;
      }

      isInitialized.value = true;
    } catch (e) {
      console.error('Failed to init data', e);
    } finally {
      isLoading.value = false;
    }
  };

  const switchDashboardYear = async (year: number) => {
    dashboardYear.value = year;
    isLoading.value = true;
    try {
      const res = await getDashboardStats(year);
      if (res.success) {
        dashboardStats.value = res.data;
      }
    } catch (e) {
      console.error('Switch year error', e);
    } finally {
      isLoading.value = false;
    }
  };

  // --- Computed Logic ---
  const taxAnalysis = computed(() => {
    const targetYear = dashboardYear.value;
    const thisYearRecords = salaryHistory.value
      .filter(r => r.year === targetYear)
      .sort((a, b) => a.period.localeCompare(b.period));

    const trend = thisYearRecords.map(record => {
      const monthStr = record.period.split('-')[1] + '月';
      return {
        month: monthStr,
        accumulated: record.raw.gross,
        currentRate: 0
      };
    });

    let acc = 0;
    const finalTrend = trend.map(item => {
      acc += item.accumulated;
      let rate = 3;
      if (acc > 960000) rate = 45;
      else if (acc > 660000) rate = 35;
      else if (acc > 420000) rate = 30;
      else if (acc > 300000) rate = 25;
      else if (acc > 144000) rate = 20;
      else if (acc > 36000) rate = 10;

      return {
        month: item.month,
        accumulated: acc,
        currentRate: rate
      };
    });

    const totalTaxVal = thisYearRecords.reduce((sum, r) => sum + r.raw.tax, 0);
    const totalGrossVal = thisYearRecords.reduce((sum, r) => sum + r.raw.gross, 0);
    const effectiveRate = totalGrossVal > 0 ? ((totalTaxVal / totalGrossVal) * 100).toFixed(1) : '0.0';

    return {
      trend: finalTrend,
      kpi: {
        totalTax: `¥${totalTaxVal.toLocaleString()}`,
        totalTaxTrend: '+4.2%',
        effectiveRate: effectiveRate,
        deductionSavings: '¥24,000'
      }
    };
  });

  // [优化2保留] 收入结构：固定=岗位+月度绩效+综合补贴; 绩效=季度+年度; 补贴=防暑+伙食+其他(加班)
  const incomeStructure = computed(() => {
    const targetYear = dashboardYear.value;
    const thisYearRecords = salaryHistory.value.filter(r => r.year === targetYear);

    let fixed = 0;
    let performance = 0;
    let special = 0;
    let subsidies = 0;
    let total = 0;

    const parse = (val: string | undefined) => parseFloat(val || '0');

    thisYearRecords.forEach(record => {
      const inc = record.details.income;

      // 1. 固定薪资: 岗位工资 + 月度绩效 + 综合补贴
      const f = parse(inc['岗位工资']) + parse(inc['月度绩效']) + parse(inc['综合补贴']);
      fixed += f;

      // 2. 绩效奖金: 季度绩效 + 年度绩效
      const p = parse(inc['季度绩效']) + parse(inc['年度绩效']);
      performance += p;

      // 3. 专项激励: 人才特区奖金 + 专项激励
      const s = parse(inc['人才特区奖金']) + parse(inc['专项激励']);
      special += s;

      // 4. 补贴福利: 防暑降温 + 伙食补贴 + 其他工资
      const sub = parse(inc['防暑降温']) + parse(inc['伙食补贴']) + parse(inc['其他工资']);
      subsidies += sub;

      total += (f + p + s + sub);
    });

    const safeTotal = total || 1;

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
        label: '补贴福利',
        value: `¥${subsidies.toLocaleString()}`,
        percent: ((subsidies / safeTotal) * 100).toFixed(1) + '%',
        colorText: 'text-amber-500',
        colorClass: 'bg-amber-500'
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

  // [优化2保留] 年度总薪酬 = Gross + 伙食补贴
  const totalAnnualGross = computed(() => {
    const targetYear = dashboardYear.value;
    const records = salaryHistory.value.filter(r => r.year === targetYear);

    const total = records.reduce((sum, r) => {
      const gross = r.raw.gross;
      const meal = parseFloat(r.details.income['伙食补贴'] || '0');
      return sum + gross + meal;
    }, 0);

    return `¥${total.toLocaleString()}`;
  });

  return {
    salaryHistory,
    dashboardStats,
    benefitsStats,
    isLoading,
    dashboardYear,
    availableYears,
    initData,
    switchDashboardYear,
    taxAnalysis,
    incomeStructure,
    totalAnnualGross,
    netIncomeMiniChartData // [新增导出]
  };
});