import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useWageStore } from './wage.store';
import { getDashboardStats, type DashboardStats } from '@/api/dashboard';
// [新增] 引入 Asset API
import { getAssetEvents, createAssetEvent, type AssetEvent } from '@/api/assets';

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

  // === [Step 1-3] 公积金 UI 状态与真实数据 ===
  const isProvidentModalOpen = ref(false);
  const providentHistory = ref<AssetEvent[]>([]);

  // 余额计算属性：直接透传后端动态计算的统计值
  const providentFundBalance = computed(() => dashboardStats.value.providentFundAccumulated);

  // 辅助显示：上一年度结息 (从流水中查找最近的一笔 INTEREST)
  const lastYearInterest = computed(() => {
    const interestEvent = providentHistory.value.find(e => e.type === 'INTEREST');
    return interestEvent ? `+¥${interestEvent.amount.toLocaleString()}` : '¥0';
  });

  const toggleProvidentModal = (isOpen: boolean) => {
    isProvidentModalOpen.value = isOpen;
    // 打开弹窗时，顺便刷新一下最新流水，保证数据鲜活
    if (isOpen) {
      fetchHistory();
    }
  };

  // --- Actions ---

  // 1. 获取流水记录
  const fetchHistory = async () => {
    try {
      const res = await getAssetEvents();
      if (res.success) {
        // 简单格式化日期，仅展示 YYYY-MM-DD
        providentHistory.value = res.data.map(e => ({
          ...e,
          date: e.occurredAt.split('T')[0] // 适配前端 UI 显示字段
        }));
      }
    } catch (e) {
      console.error('Fetch asset history failed', e);
    }
  };

  // 封装内部使用的 Stats 请求，避免代码重复
  const getDashboardStatsApi = async (year: number) => {
    const res = await getDashboardStats(year);
    if (res.success) {
      dashboardStats.value = res.data;
    }
  };

  // 2. 提交资产变动 (提取/结息/校准)
  const submitProvidentRecord = async (payload: { type: string; category: string; amount: number; date: string; note: string }) => {
    try {
      isLoading.value = true;
      // A. 调用提交接口
      const res = await createAssetEvent({
        type: payload.type,
        category: payload.category,
        amount: payload.amount,
        occurredAt: payload.date, // 确保是 ISO 格式或后端能解析的字符串
        note: payload.note
      });

      if (res.success) {
        // B. 提交成功后，必须重新获取 Dashboard Stats (因为余额变了)
        // C. 同时也刷新流水列表
        await Promise.all([
          getDashboardStatsApi(dashboardYear.value),
          fetchHistory()
        ]);
      }
    } catch (e) {
      console.error('Submit asset event failed', e);
      // 实际项目中这里应该弹出 Toast 错误提示
    } finally {
      isLoading.value = false;
    }
  };

  // 3. 初始化 Dashboard (聚合调用)
  const initDashboard = async () => {
    isLoading.value = true;
    try {
      // 并行请求：薪资历史 + Dashboard 指标 + 资产流水
      await Promise.all([
        wageStore.fetchHistory(),
        getDashboardStatsApi(dashboardYear.value),
        fetchHistory()
      ]);

      const history = wageStore.salaryHistory;
      if (history && history.length > 0) {
        const hasCurrentYear = history.some(r => r.year === dashboardYear.value);
        if (!hasCurrentYear) {
          const first = history[0];
          if (first) {
            dashboardYear.value = first.year;
            // 年份变了，重新拉取一次 Stats
            await getDashboardStatsApi(dashboardYear.value);
          }
        }
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
      await getDashboardStatsApi(year);
    } finally {
      isLoading.value = false;
    }
  };

  // --- Getters (原有图表逻辑保持不变) ---
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
    switchYear,
    // [Export]
    isProvidentModalOpen,
    providentFundBalance,
    lastYearInterest,
    providentHistory,
    toggleProvidentModal,
    submitProvidentRecord
  };
});