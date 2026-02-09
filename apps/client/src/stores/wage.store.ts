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
    netIncomeChange: '+0%',
    taxPaid: '¥0',
    // [修改] 初始化新字段
    providentFundAccumulated: '¥0',
    annuityAccumulated: '¥0'
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

  const parse = (v: string | undefined) => parseFloat(String(v || '0').replace(/[^0-9.-]+/g, "")) || 0;

  // [现有] 净收入迷你图数据 (受年份影响)
  const netIncomeMiniChartData = computed(() => {
    const targetYear = dashboardYear.value;
    return salaryHistory.value
      .filter(r => r.year === targetYear)
      .sort((a, b) => a.period.localeCompare(b.period))
      .map(r => r.raw.net);
  });

  // [新增] 公积金全量趋势数据 (不受年份影响)
  // 逻辑：全量历史数据，按时间正序排列，计算双边缴存额 (个人*2)
  const providentFundTrend = computed(() => {
    return salaryHistory.value
      .slice()
      .sort((a, b) => a.period.localeCompare(b.period))
      .map(r => parse(r.details.deductions['住房公积金']) * 2);
  });

  // [新增] 企业年金全量趋势数据 (不受年份影响)
  // 逻辑：全量历史数据，按时间正序排列，计算总额 (个人*5)
  const annuityTrend = computed(() => {
    return salaryHistory.value
      .slice()
      .sort((a, b) => a.period.localeCompare(b.period))
      .map(r => parse(r.details.deductions['企业年金']) * 5);
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
        // Switch year also refreshes stats
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

  const incomeStructure = computed(() => {
    const targetYear = dashboardYear.value;
    const thisYearRecords = salaryHistory.value.filter(r => r.year === targetYear);

    let fixed = 0;
    let performance = 0;
    let special = 0;
    let subsidies = 0;
    let total = 0;

    thisYearRecords.forEach(record => {
      const inc = record.details.income;
      const f = parse(inc['岗位工资']) + parse(inc['月度绩效']) + parse(inc['综合补贴']);
      fixed += f;
      const p = parse(inc['季度绩效']) + parse(inc['年度绩效']);
      performance += p;
      const s = parse(inc['人才特区奖金']) + parse(inc['专项激励']);
      special += s;
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
    netIncomeMiniChartData,
    providentFundTrend, // [新增导出]
    annuityTrend        // [新增导出]
  };
});