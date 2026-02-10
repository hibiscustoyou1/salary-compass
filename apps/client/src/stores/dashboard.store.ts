import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useWageStore } from './wage.store';
import { getDashboardStats, type DashboardStats } from '@/api/dashboard';
import {getAssetEvents, createAssetEvent, type AssetEvent, deleteAssetEvent} from '@/api/assets';

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

  // === 公积金资产管理状态 ===
  const isProvidentModalOpen = ref(false);
  const providentHistory = ref<AssetEvent[]>([]);     // 最近 5 条 (Dashboard/Modal首页使用)
  const fullProvidentHistory = ref<AssetEvent[]>([]); // 全量流水 (Modal历史页使用)

  // 余额计算属性：直接透传后端动态计算的统计值
  const providentFundBalance = computed(() => dashboardStats.value.providentFundAccumulated);

  // 辅助显示：上一年度结息 (从近期流水中查找最近的一笔 INTEREST)
  const lastYearInterest = computed(() => {
    // 优先从 fullHistory 找，如果没有则找 recent
    const source = fullProvidentHistory.value.length > 0 ? fullProvidentHistory.value : providentHistory.value;
    const interestEvent = source.find(e => e.type === 'INTEREST');
    return interestEvent ? `+¥${interestEvent.amount.toLocaleString()}` : '¥0';
  });

  // --- Actions ---

  // 1. 获取流水记录 (支持 mode: recent | all)
  const fetchHistory = async (mode: 'recent' | 'all' = 'recent') => {
    try {
      // recent 限制 5 条，all 不限制
      const limit = mode === 'recent' ? 5 : undefined;
      const res = await getAssetEvents({ limit });

      if (res.success) {
        const formatted = res.data.map(e => ({
          ...e,
          date: e.occurredAt.split('T')[0] // 格式化日期 YYYY-MM-DD
        }));

        if (mode === 'recent') {
          providentHistory.value = formatted;
        } else {
          fullProvidentHistory.value = formatted;
        }
      }
    } catch (e) {
      console.error('Fetch asset history failed', e);
    }
  };

  const toggleProvidentModal = (isOpen: boolean) => {
    isProvidentModalOpen.value = isOpen;
    // 打开弹窗时，默认刷新一下"近期"流水
    if (isOpen) {
      fetchHistory('recent');
    }
  };

  // 内部辅助：刷新 Dashboard 指标
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
        occurredAt: payload.date,
        note: payload.note
      });

      if (res.success) {
        // B. 提交成功后，重新计算余额并刷新近期流水
        await Promise.all([
          getDashboardStatsApi(dashboardYear.value),
          fetchHistory('recent')
        ]);

        // C. 如果全量历史已经被加载过，也顺便刷新一下，保持一致性
        if (fullProvidentHistory.value.length > 0) {
          fetchHistory('all');
        }
      }
    } catch (e) {
      console.error('Submit asset event failed', e);
    } finally {
      isLoading.value = false;
    }
  };

  // 3. 初始化 Dashboard
  const initDashboard = async () => {
    isLoading.value = true;
    try {
      // 并行请求
      await Promise.all([
        wageStore.fetchHistory(),
        getDashboardStatsApi(dashboardYear.value),
        fetchHistory('recent')
      ]);

      // 自动校正年份
      const history = wageStore.salaryHistory;
      if (history && history.length > 0) {
        const hasCurrentYear = history.some(r => r.year === dashboardYear.value);
        if (!hasCurrentYear) {
          const first = history[0];
          if (first) {
            dashboardYear.value = first.year;
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

  // --- Getters (图表数据源) ---
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

  const removeProvidentRecord = async (id: string) => {
    try {
      isLoading.value = true;
      const res = await deleteAssetEvent(id);

      if (res.success) {
        // 删除成功后，全量刷新所有数据 (余额变动、列表变动)
        await Promise.all([
          getDashboardStatsApi(dashboardYear.value),
          fetchHistory('recent'),
          fetchHistory('all') // 确保两个列表都同步
        ]);
      }
      return res.success;
    } catch (e) {
      console.error('Delete asset event failed', e);
      return false;
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
    switchYear,
    // [公积金模块 Export]
    isProvidentModalOpen,
    providentFundBalance,
    lastYearInterest,
    providentHistory,
    fullProvidentHistory, // 导出全量历史
    toggleProvidentModal,
    submitProvidentRecord,
    fetchHistory,
    removeProvidentRecord
  };
});