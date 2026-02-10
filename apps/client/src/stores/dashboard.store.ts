import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useWageStore } from './wage.store';
import { getDashboardStats, type DashboardStats } from '@/api/dashboard';

export const useDashboardStore = defineStore('dashboard', () => {
  const wageStore = useWageStore();

  const dashboardYear = ref(new Date().getFullYear());
  const dashboardStats = ref<DashboardStats>({
    netIncomeYTD: '¥0',
    netIncomeChange: '+0%',
    taxPaid: '¥0',
    providentFundAccumulated: '¥0',
    annuityAccumulated: '¥0'
  });
  const isLoading = ref(false);

  // --- Getters ---
  const availableYears = computed(() => {
    const years = new Set(wageStore.salaryHistory.map(item => item.year));
    return Array.from(years).sort((a, b) => b - a);
  });

  const parse = (v: string | undefined) => parseFloat(String(v || '0').replace(/[^0-9.-]+/g, "")) || 0;

  const netIncomeMiniChartData = computed(() => {
    const targetYear = dashboardYear.value;
    return wageStore.salaryHistory
      .filter(r => r.year === targetYear)
      .sort((a, b) => a.period.localeCompare(b.period))
      .map(r => r.raw.net);
  });

  const providentFundTrend = computed(() => {
    return wageStore.salaryHistory
      .slice()
      .sort((a, b) => a.period.localeCompare(b.period))
      .map(r => parse(r.details.deductions['住房公积金']) * 2);
  });

  const annuityTrend = computed(() => {
    return wageStore.salaryHistory
      .slice()
      .sort((a, b) => a.period.localeCompare(b.period))
      .map(r => parse(r.details.deductions['企业年金']) * 5);
  });

  const taxAnalysis = computed(() => {
    const targetYear = dashboardYear.value;
    const thisYearRecords = wageStore.salaryHistory
      .filter(r => r.year === targetYear)
      .sort((a, b) => a.period.localeCompare(b.period));

    const totalTaxVal = thisYearRecords.reduce((sum, r) => sum + r.raw.tax, 0);
    const totalGrossVal = thisYearRecords.reduce((sum, r) => sum + r.raw.gross, 0);
    const effectiveRate = totalGrossVal > 0 ? ((totalTaxVal / totalGrossVal) * 100).toFixed(1) : '0.0';

    const trend = thisYearRecords.map(record => ({
      month: record.period.split('-')[1] + '月',
      accumulated: record.raw.gross,
      currentRate: 0
    }));

    // 简单累进税率逻辑模拟 (省略复杂判断，仅为了保留结构)
    let acc = 0;
    trend.forEach(t => { acc += t.accumulated; });

    return {
      trend: trend,
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
    const thisYearRecords = wageStore.salaryHistory.filter(r => r.year === targetYear);

    let fixed = 0, performance = 0, special = 0, subsidies = 0, total = 0;

    thisYearRecords.forEach(record => {
      const inc = record.details.income;
      const f = parse(inc['岗位工资']) + parse(inc['月度绩效']) + parse(inc['综合补贴']);
      const p = parse(inc['季度绩效']) + parse(inc['年度绩效']);
      const s = parse(inc['人才特区奖金']) + parse(inc['专项激励']);
      const sub = parse(inc['防暑降温']) + parse(inc['伙食补贴']) + parse(inc['其他工资']);
      fixed += f; performance += p; special += s; subsidies += sub;
      total += (f + p + s + sub);
    });

    const safeTotal = total || 1;
    return [
      { label: '固定薪资', value: `¥${fixed.toLocaleString()}`, percent: ((fixed / safeTotal) * 100).toFixed(1) + '%', colorText: 'text-primary', colorClass: 'bg-primary' },
      { label: '绩效奖金', value: `¥${performance.toLocaleString()}`, percent: ((performance / safeTotal) * 100).toFixed(1) + '%', colorText: 'text-blue-400', colorClass: 'bg-blue-400' },
      { label: '补贴福利', value: `¥${subsidies.toLocaleString()}`, percent: ((subsidies / safeTotal) * 100).toFixed(1) + '%', colorText: 'text-amber-500', colorClass: 'bg-amber-500' },
      { label: '专项激励', value: `¥${special.toLocaleString()}`, percent: ((special / safeTotal) * 100).toFixed(1) + '%', colorText: 'text-emerald-custom', colorClass: 'bg-emerald-custom' }
    ];
  });

  const totalAnnualGross = computed(() => {
    const targetYear = dashboardYear.value;
    const records = wageStore.salaryHistory.filter(r => r.year === targetYear);
    const total = records.reduce((sum, r) => sum + r.raw.gross + parseFloat(r.details.income['伙食补贴'] || '0'), 0);
    return `¥${total.toLocaleString()}`;
  });

  // --- Actions ---
  const initDashboard = async () => {
    isLoading.value = true;
    try {
      await wageStore.fetchHistory();

      const history = wageStore.salaryHistory;
      // [修复 TS2532] 安全访问数组第一个元素
      if (history && history.length > 0) {
        const hasCurrentYear = history.some(r => r.year === dashboardYear.value);
        if (!hasCurrentYear) {
          const first = history[0];
          if (first) dashboardYear.value = first.year;
        }
      }

      const res = await getDashboardStats(dashboardYear.value);
      if (res.success) {
        dashboardStats.value = res.data;
      }
    } catch (e) {
      console.error('Init dashboard error', e);
    } finally {
      isLoading.value = false;
    }
  };

  const switchYear = async (year: number) => {
    dashboardYear.value = year;
    isLoading.value = true;
    try {
      const res = await getDashboardStats(year);
      if (res.success) dashboardStats.value = res.data;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    dashboardYear,
    dashboardStats,
    availableYears,
    isLoading,
    netIncomeMiniChartData,
    providentFundTrend,
    annuityTrend,
    taxAnalysis,
    incomeStructure,
    totalAnnualGross,
    initDashboard,
    switchYear
  };
});