import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useWageStore } from './wage.store';
import { getDashboardStats, type DashboardStats } from '@/api/dashboard';
import { getAssetEvents, createAssetEvent, type AssetEvent, deleteAssetEvent } from '@/api/assets';

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
        note: payload.note,
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
      .map(r => parse(r.details.deductions.housingFund) * 2);
  });

  const annuityTrend = computed(() => {
    return wageStore.salaryHistory
      .slice()
      .sort((a, b) => a.period.localeCompare(b.period))
      .map(r => parse(r.details.deductions.corporateAnnuity) * 5);
  });

  const taxAnalysis = computed(() => {
    const targetYear = dashboardYear.value;
    const thisYearRecords = wageStore.salaryHistory
      .filter(r => r.year === targetYear)
      .sort((a, b) => a.period.localeCompare(b.period));

    const totalTaxVal = thisYearRecords.reduce((sum, r) => sum + r.raw.tax, 0);
    const totalGrossVal = thisYearRecords.reduce((sum, r) => sum + r.raw.gross, 0);
    const effectiveRate = totalGrossVal > 0 ? ((totalTaxVal / totalGrossVal) * 100).toFixed(1) : '0.0';

    // [新增] 计算专项附加扣除 (取本年度最大累计值)
    let maxRent = 0;
    let maxChild = 0;
    thisYearRecords.forEach(r => {
      const rent = parse(r.details.deductions.rentDeduction);
      const child = parse(r.details.deductions.childCareDeduction);
      if (rent > maxRent) maxRent = rent;
      if (child > maxChild) maxChild = child;
    });
    const deductionSavings = maxRent + maxChild;

    // [修正] 生成完整 12 个月的趋势数据 (Cumulative Taxable Income)
    const trend = Array.from({ length: 12 }, (_, i) => {
      const monthIndex = i + 1; // 1-12
      const monthKey = monthIndex.toString().padStart(2, '0'); // "01", "02"...
      const periodKey = `${targetYear}-${monthKey}`;

      // 截止到该月的所有记录 (用于计算累计值)
      const recordsUntilNow = thisYearRecords.filter(r => r.period <= periodKey);

      // 如果截止到该月没有任何记录，为了图表连续性，显示为 0
      if (recordsUntilNow.length === 0) {
        return {
          month: `${monthIndex}月`,
          accumulated: 0,
          currentRate: 0
        };
      }

      // 1. 累计计税基数 (cumTaxableBase) = 累计应发 + 累计伙食补贴
      // AGENT.md: taxableBase = grossTotal + mealAllowance
      const cumTaxableBase = recordsUntilNow.reduce((sum, r) => {
        // r.raw.gross 已经是 grossTotal
        // 额外的 mealAllowance 在 details.income['伙食补贴'] 中
        return sum + r.raw.gross + parse(r.details.income.mealAllowance);
      }, 0);

      // 2. 累计专项扣除 (cumDeduction) = 养老 + 医疗 + 失业 + 公积金
      const cumDeduction = recordsUntilNow.reduce((sum, r) => {
        const d = r.details.deductions;
        return sum + parse(d.pension) + parse(d.medicalInsurance) + parse(d.unemploymentIns) + parse(d.housingFund);
      }, 0);

      // 3. 累计其他扣除 (cumOtherDeduction) = 企业年金
      const cumOtherDeduction = recordsUntilNow.reduce((sum, r) => {
        return sum + parse(r.details.deductions.corporateAnnuity);
      }, 0);

      // 4. 累计专项附加扣除 (cumSpecialAddDeduction)
      // 取截止当月记录中的最新一条记录的累计值
      // 假设后端返回的 detached '累计xxx' 字段已经是截止该月的年度累计值
      const lastRecord = recordsUntilNow[recordsUntilNow.length - 1];
      // lastRecord 肯定存在，因为上面已经 check 了 recordsUntilNow.length === 0
      const currentMonthRent = lastRecord ? parse(lastRecord.details.deductions.rentDeduction) : 0;
      const currentMonthChild = lastRecord ? parse(lastRecord.details.deductions.childCareDeduction) : 0;
      const cumSpecialAddDeduction = currentMonthRent + currentMonthChild;

      // 5. 累计减除费用 (cumExemption) = 5000 * 当前月份数
      // 注意：应该是 * (当前月份索引)，即 1月*1, 2月*2...
      // 但实际上个税系统是看你的任职受雇月份数，这里简化假设为从年初开始
      const cumExemption = 5000 * monthIndex;

      // 6. 累计应纳税所得额 (cumTaxableIncome)
      // AGENT.md: cumTaxableIncome = Σ(taxableBase) - cumDeduction - cumSpecialAddDeduction - cumExemption - cumOtherDeduction
      const calculatedIncome = cumTaxableBase - cumDeduction - cumSpecialAddDeduction - cumExemption - cumOtherDeduction;
      const accumulated = Math.max(0, calculatedIncome);

      // 计算当前适用税率 (仅用于图表展示)
      // 简单根据 accumulated 查表，不做精确推导
      // 0-36000: 3%, 36000-144000: 10%, ...
      let currentRate = 0;
      if (accumulated <= 36000) currentRate = 3;
      else if (accumulated <= 144000) currentRate = 10;
      else if (accumulated <= 300000) currentRate = 20;
      else if (accumulated <= 420000) currentRate = 25;
      else if (accumulated <= 660000) currentRate = 30;
      else if (accumulated <= 960000) currentRate = 35;
      else currentRate = 45;

      return {
        month: `${monthIndex}月`,
        accumulated: accumulated,
        currentRate: currentRate
      };
    });

    // [新增] 生成税务优化建议 (专家级 - 奖金择优算法)
    const suggestions: Array<{ type: 'warning' | 'success'; icon: string; segments: Array<{ text: string; bold?: boolean; color?: string }> }> = [];

    // 定义个税计算辅助函数 (根据 2019 新个税法)
    const TAX_TABLE = [
      { max: 36000, rate: 0.03, deduct: 0 },
      { max: 144000, rate: 0.10, deduct: 2520 },
      { max: 300000, rate: 0.20, deduct: 16920 },
      { max: 420000, rate: 0.25, deduct: 31920 },
      { max: 660000, rate: 0.30, deduct: 52920 },
      { max: 960000, rate: 0.35, deduct: 85920 },
      { max: Infinity, rate: 0.45, deduct: 181920 }
    ];

    const getTaxBracket = (income: number) => {
      return TAX_TABLE.find(b => income <= b.max) || TAX_TABLE[TAX_TABLE.length - 1]!;
    };

    const calcTax = (income: number) => {
      const bracket = getTaxBracket(income);
      return income * bracket.rate - bracket.deduct;
    };

    // 全年一次性奖金计税 (除以12找税率)
    const calcBonusTax = (bonus: number) => {
      if (bonus <= 0) return 0;
      const monthAmount = bonus / 12;
      const bracket = getTaxBracket(monthAmount);
      return bonus * bracket.rate - bracket.deduct;
    };

    // 1. 识别潜在奖金月份 (人才奖 talentBonus 或 年终奖 annualBonus > 0)
    const bonusCandidates = thisYearRecords
      .map(r => {
        const talent = parse(r.details.income.talentBonus);
        const annual = parse(r.details.income.annualBonus);
        return {
          month: r.period.split('-')[1] + '月',
          amount: talent + annual,
          rawRecord: r
        };
      })
      .filter(b => b.amount > 5000); // 忽略小额奖金

    // 2. 只有当存在至少一笔奖金时，才进行筹划
    if (bonusCandidates.length > 0) {
      // 基础信息：全年总累计信息 (不含任何奖金的各种扣除后基数)
      // 注意：这里需要重新从原始数据聚合，扣除掉 bonusCandidates 里的金额，因为我们要模拟
      // 简化逻辑：我们假设 thisYearRecords 里的 gross 包含了这些奖金。
      // 全年综合所得应纳税所得额 (默认所有奖金都并入) = lastMonth.accumulated (大致)
      // 准确做法：
      const totalGross = thisYearRecords.reduce((sum, r) => sum + r.raw.gross + parse(r.details.income.mealAllowance), 0);
      const totalDeductions = thisYearRecords.reduce((sum, r) => {
        const d = r.details.deductions;
        return sum + parse(d.pension) + parse(d.medicalInsurance) + parse(d.unemploymentIns) + parse(d.housingFund)
          + parse(d.corporateAnnuity) + parse(d.rentDeduction) + parse(d.childCareDeduction); // 简化取最后一条的累计? 不，应该取年度有效扣除
        // 注意：store 上面的 trend 计算里 Deductions 是累加的，但 SpecialAdd 是取 max。
        // 这里为简化模拟，直接取 trend 最后一个月的 accumulated 作为 "在此之前的默认计税基数" 
        // 但 accumulated 已经是 (Gross - Deductions - 60000)，即"综合所得应纳税所得额"
      }, 0);

      // 我们用一种更直接的方法：
      // BaseTaxable = 最后一个月的 accumulated (假设它包含了所有奖金并入的情况)
      const lastMonthTrend = trend[trend.length - 1]; // 12月的
      // 如果还没到12月，取当前最新的
      const currentTrend = trend.find(t => t.month === bonusCandidates[bonusCandidates.length - 1]?.month) || trend[trend.length - 1];

      // 实际上，trend[11].accumulated 就是 "全年综合所得应纳税所得额" (假设所有都并入)
      // 我们以此为基准：TotalTaxableWithAllMerged = trend[11].accumulated
      const baseTaxable = trend[11]?.accumulated || 0;

      // 模拟场景列表
      const scenarios = bonusCandidates.map(candidate => {
        // 场景：将 candidate 这一笔奖金单独计税
        const bonusPart = candidate.amount;
        const taxForBonus = calcBonusTax(bonusPart);

        // 剩余综合所得 = 原综合所得 - 该笔奖金
        const remainingTaxable = Math.max(0, baseTaxable - bonusPart);
        const taxForComprehensive = calcTax(remainingTaxable);

        return {
          month: candidate.month,
          selectedBonus: bonusPart,
          totalTax: taxForBonus + taxForComprehensive,
          label: `${candidate.month}单独计税`
        };
      });

      // 对照组：全部并入综合所得 (即当前状态)
      const defaultTax = calcTax(baseTaxable);
      scenarios.push({
        month: '全部并入',
        selectedBonus: 0,
        totalTax: defaultTax,
        label: '全部并入综合所得'
      });

      // 找最优解
      scenarios.sort((a, b) => a.totalTax - b.totalTax);
      const best = scenarios[0];
      const worst = scenarios[scenarios.length - 1];
      const saved = (worst && best) ? (worst.totalTax - best.totalTax) : 0;

      // 构建明细字符串 (例如 "5月(¥80,000)、12月(¥30,000)")
      const detailStr = bonusCandidates.map(c => `${c.month}(¥${c.amount.toLocaleString()})`).join('、');

      if (saved > 100 && best && best.month !== '全部并入') {
        suggestions.push({
          type: 'success',
          icon: 'stars',
          segments: [
            { text: `检测到 ${bonusCandidates.length} 笔大额奖金：` },
            { text: detailStr, bold: true },
            { text: '。建议选择 ' },
            { text: best.month, bold: true, color: 'text-emerald-700 dark:text-emerald-400' },
            { text: ` 申报全年一次性奖金。预计比最差方案节省税金 ` },
            { text: `¥${Math.floor(saved).toLocaleString()}`, bold: true, color: 'text-red-500' },
            { text: '。' }
          ]
        });
      } else if (best && best.month === '全部并入') { // bonusCandidates.length > 0 is implied
        suggestions.push({
          type: 'success',
          icon: 'info',
          segments: [
            { text: '经测算，将所有奖金 ' },
            { text: detailStr, bold: true },
            { text: ' 并入综合所得', bold: true },
            { text: ' 计税最划算（您的日常税率可能低于奖金单独税率）。' }
          ]
        });
      }
    }

    if (deductionSavings === 0 && totalGrossVal > 60000 && parseFloat(effectiveRate) > 0) {
      suggestions.push({
        type: 'warning',
        icon: 'notifications_active',
        segments: [
          { text: '未检测到 ' },
          { text: '专项附加扣除', bold: true },
          { text: '，申报租金/房贷/子女教育等可直接抵扣个税。' }
        ]
      });
    }

    // 4. 默认提示 (如果没有其他建议)
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'success',
        icon: 'verified',
        segments: [
          { text: '当前税负结构良好，暂无优化建议。' }
        ]
      });
    }

    return {
      trend: trend,
      kpi: {
        totalTax: `¥${totalTaxVal.toLocaleString()}`,
        totalTaxTrend: '+4.2%',
        effectiveRate: effectiveRate,
        deductionSavings: `¥${Math.floor(deductionSavings).toLocaleString()}`
      },
      suggestions: suggestions
    };
  });

  const incomeStructure = computed(() => {
    const targetYear = dashboardYear.value;
    const thisYearRecords = wageStore.salaryHistory.filter(r => r.year === targetYear);

    let fixed = 0, performance = 0, special = 0, subsidies = 0, total = 0;

    thisYearRecords.forEach(record => {
      const inc = record.details.income;
      const f = parse(inc.baseSalary) + parse(inc.meritPay) + parse(inc.subsidy);
      const p = parse(inc.quarterlyBonus) + parse(inc.annualBonus);
      const s = parse(inc.talentBonus) + parse(inc.specialIncentive);
      const sub = parse(inc.heatSubsidy) + parse(inc.mealAllowance) + parse(inc.otherWage);
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
    const total = records.reduce((sum, r) => sum + r.raw.gross + parseFloat(r.details.income.mealAllowance || '0'), 0);
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