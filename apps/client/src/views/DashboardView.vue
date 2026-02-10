<template>
  <div class="max-w-[1400px] mx-auto flex flex-col gap-6" v-if="isActive">

    <ProvidentFundModal />

    <div class="flex justify-between items-center bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-sm border border-border-light dark:border-border-dark">
      <div>
        <h2 class="text-lg font-bold text-text-main-light dark:text-white">年度概览</h2>
        <p class="text-xs text-text-secondary-light dark:text-text-secondary-dark">查看 {{ dashboardStore.dashboardYear }} 年度核心财务指标</p>
      </div>
      <div class="relative z-20" ref="yearDropdownRef">
        <button @click="isYearDropdownOpen = !isYearDropdownOpen"
                class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-text-main-light dark:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border border-transparent focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none">
          <span>{{ dashboardStore.dashboardYear }}年</span>
          <span class="material-symbols-outlined text-lg transition-transform duration-300" :class="{ 'rotate-180': isYearDropdownOpen }">expand_more</span>
        </button>
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div v-if="isYearDropdownOpen" class="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-border-light dark:border-border-dark py-2 overflow-hidden origin-top-right">
            <div class="max-h-60 overflow-y-auto custom-scrollbar">
              <button v-for="year in dashboardStore.availableYears" :key="year"
                      @click="handleYearSelect(year)"
                      class="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group"
                      :class="dashboardStore.dashboardYear === year ? 'text-primary font-bold bg-primary/5 dark:bg-primary/10' : 'text-text-secondary-light dark:text-text-secondary-dark'">
                <span>{{ year }}年</span>
                <span v-if="dashboardStore.dashboardYear === year" class="material-symbols-outlined text-base">check</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div v-if="dashboardStore.isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        <div class="bg-card-light dark:bg-card-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-soft hover:shadow-md transition-all group">
          <div class="flex justify-between items-start mb-2">
            <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">本年至今净收入</p>
            <span class="material-symbols-outlined text-emerald-custom bg-emerald-custom/10 p-1 rounded text-lg">trending_up</span>
          </div>
          <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ masked(dashboardStore.dashboardStats.netIncomeYTD) }}</h3>
          <div class="flex items-center gap-2">
             <span :class="[
              dashboardStore.dashboardStats.netIncomeChange.startsWith('-')
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                : 'text-emerald-custom bg-emerald-custom/10',
              'text-sm font-semibold px-1.5 py-0.5 rounded'
            ]">
              {{ dashboardStore.dashboardStats.netIncomeChange }}
            </span>
            <span class="text-text-secondary-light dark:text-text-secondary-dark text-xs">同比去年</span>
          </div>
          <div class="h-10 mt-3 w-full opacity-50 group-hover:opacity-100 transition-opacity">
            <BaseEChart v-if="!privacyMode" :options="miniLineOption" />
            <div v-else class="h-full w-full flex items-center justify-center text-text-secondary-light text-xl tracking-widest font-bold">****</div>
          </div>
        </div>

        <div class="bg-card-light dark:bg-card-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-soft hover:shadow-md transition-all group">
          <div class="flex justify-between items-start mb-2">
            <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">已缴税额总计</p>
            <span class="material-symbols-outlined text-red-custom bg-red-custom/10 p-1 rounded text-lg">account_balance</span>
          </div>
          <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ masked(dashboardStore.dashboardStats.taxPaid) }}</h3>
          <div class="flex items-center gap-2">
            <span class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">{{ dashboardStore.taxAnalysis.kpi.effectiveRate }}% 有效税率</span>
          </div>
          <div class="h-10 mt-3 w-full opacity-50 group-hover:opacity-100 transition-opacity">
            <div v-if="!privacyMode" class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
              <div class="bg-red-custom h-full rounded-full" :style="{ width: dashboardStore.taxAnalysis.kpi.effectiveRate + '%' }"></div>
            </div>
            <div v-else class="h-full w-full flex items-center justify-center text-text-secondary-light text-xl tracking-widest font-bold">****</div>
          </div>
        </div>

        <div
          @click="dashboardStore.toggleProvidentModal(true)"
          class="bg-card-light dark:bg-card-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-soft hover:shadow-md transition-all group relative cursor-pointer hover:border-primary/50 dark:hover:border-primary/50"
          title="点击管理公积金资产"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="flex items-center gap-1">
              <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">公积金余额</p>
              <span class="material-symbols-outlined text-[16px] text-text-secondary-light" title="基于校准值和薪资流水估算">help</span>
            </div>
            <div>
              <span class="material-symbols-outlined text-primary bg-primary/10 p-1 rounded text-lg">domain</span>
            </div>
          </div>

          <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">
            {{ masked(dashboardStore.providentFundBalance) }}
          </h3>

          <div class="flex items-center gap-2">
            <span class="text-xs text-emerald-custom bg-emerald-custom/10 px-1.5 py-0.5 rounded font-medium">+{{ dashboardStore.lastYearInterest }}</span>
            <span class="text-text-secondary-light dark:text-text-secondary-dark text-xs">上年度结息</span>
          </div>

          <div class="h-10 mt-3 w-full opacity-50 group-hover:opacity-100 transition-opacity">
            <BaseEChart v-if="!privacyMode" :options="providentFundTrendOption" />
            <div v-else class="h-full w-full flex items-center justify-center text-text-secondary-light text-xl tracking-widest font-bold">****</div>
          </div>
        </div>

        <div class="bg-card-light dark:bg-card-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-soft hover:shadow-md transition-all group">
          <div class="flex justify-between items-start mb-2">
            <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">企业年金积累 (全量)</p>
            <span class="material-symbols-outlined text-blue-400 bg-blue-400/10 p-1 rounded text-lg">savings</span>
          </div>
          <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ masked(dashboardStore.dashboardStats.annuityAccumulated) }}</h3>
          <div class="flex items-center gap-2">
            <span class="text-text-secondary-light dark:text-text-secondary-dark text-xs">公司4:1配比 | 个人x5</span>
          </div>
          <div class="h-10 mt-3 w-full opacity-50 group-hover:opacity-100 transition-opacity flex items-center justify-center relative">
            <BaseEChart v-if="!privacyMode" :options="annuityTrendOption" />
            <div v-else class="h-full w-full flex items-center justify-center text-text-secondary-light text-xl tracking-widest font-bold">****</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-soft flex flex-col">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-lg font-bold text-text-main-light dark:text-white">毛收入 vs 净收入趋势</h3>
              <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {{ dashboardStore.dashboardYear }} 年度月度趋势
              </p>
            </div>
          </div>
          <div class="flex-1 min-h-[300px]">
            <BaseEChart :options="trendChartOption" />
          </div>
        </div>

        <div class="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-soft flex flex-col">
          <h3 class="text-lg font-bold text-text-main-light dark:text-white mb-1">收入结构健康度</h3>
          <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">年度薪酬构成比例</p>

          <div class="flex-1 flex flex-col justify-center gap-6">
            <div v-if="dashboardStore.incomeStructure.length === 0" class="flex items-center justify-center h-full text-text-secondary-light text-sm">
              暂无本年度数据
            </div>
            <div v-else v-for="(item, idx) in dashboardStore.incomeStructure" :key="idx" class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="font-medium text-text-main-light dark:text-white">{{ item.label }}</span>
                <span class="font-bold" :class="item.colorText">{{ masked(item.value) }}</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-1000" :class="item.colorClass" :style="{ width: item.percent }"></div>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-border-light dark:border-border-dark">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">年度总薪酬</span>
              <span class="text-xl font-black text-text-main-light dark:text-white">{{ masked(dashboardStore.totalAnnualGross) }}</span>
            </div>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import BaseEChart from '@/components/charts/BaseEChart.vue';
  import * as echarts from 'echarts';
  import { useWageStore } from '@/stores/wage.store';
  import { useDashboardStore } from '@/stores/dashboard.store';
  // [新增] 引入弹窗组件
  import ProvidentFundModal from '@/components/modals/ProvidentFundModal.vue';

  const props = defineProps<{
    isActive: boolean;
    privacyMode: boolean;
  }>();

  const wageStore = useWageStore();
  const dashboardStore = useDashboardStore();

  const isYearDropdownOpen = ref(false);
  const yearDropdownRef = ref<HTMLElement | null>(null);

  onMounted(() => {
    dashboardStore.initDashboard();
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });

  const handleYearSelect = (year: number) => {
    dashboardStore.switchYear(year);
    isYearDropdownOpen.value = false;
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (yearDropdownRef.value && !yearDropdownRef.value.contains(e.target as Node)) {
      isYearDropdownOpen.value = false;
    }
  };

  const masked = (val: string) => props.privacyMode ? '****' : val;

  const miniLineOption = computed(() => {
    const data = dashboardStore.netIncomeMiniChartData;
    const chartData = data.length ? data : [0, 0, 0, 0, 0, 0];
    return {
      grid: { top: 0, bottom: 0, left: 0, right: 0 },
      xAxis: { show: false, type: 'category', data: chartData.map((_, i) => i) },
      yAxis: { show: false, min: 'dataMin' },
      series: [{
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: chartData,
        lineStyle: { color: '#10b981', width: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(16, 185, 129, 0.2)' }, { offset: 1, color: 'rgba(16, 185, 129, 0)' }]
          }
        }
      }]
    };
  });

  const providentFundTrendOption = computed(() => {
    const chartData = dashboardStore.providentFundTrend;
    return {
      grid: { top: 0, bottom: 0, left: 0, right: 0 },
      xAxis: { show: false, type: 'category', data: chartData.map((_, i) => i) },
      yAxis: { show: false, min: 'dataMin' },
      series: [{
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: chartData,
        lineStyle: { color: '#1241a1', width: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(18, 65, 161, 0.2)' }, { offset: 1, color: 'rgba(18, 65, 161, 0)' }]
          }
        }
      }]
    };
  });

  const annuityTrendOption = computed(() => {
    const chartData = dashboardStore.annuityTrend;
    return {
      grid: { top: 0, bottom: 0, left: 0, right: 0 },
      xAxis: { show: false, type: 'category', data: chartData.map((_, i) => i) },
      yAxis: { show: false, min: 'dataMin' },
      series: [{
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: chartData,
        lineStyle: { color: '#60a5fa', width: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(96, 165, 250, 0.2)' }, { offset: 1, color: 'rgba(96, 165, 250, 0)' }]
          }
        }
      }]
    };
  });

  const trendChartOption = computed(() => {
    const isHidden = props.privacyMode;
    const chartData = wageStore.salaryHistory
      .filter(item => item.year === dashboardStore.dashboardYear)
      .sort((a, b) => a.period.localeCompare(b.period))
      .map(item => ({
        period: item.period.split('-')[1] + '月',
        gross: item.raw.gross,
        net: item.raw.net
      }));

    const periods = chartData.map(d => d.period);
    const grossData = chartData.map(d => d.gross);
    const netData = chartData.map(d => d.net);

    return {
      grid: { top: 40, right: 20, bottom: 20, left: 50, containLabel: true },
      tooltip: {
        trigger: 'axis',
        formatter: isHidden ? '****' : undefined
      },
      legend: {
        show: !isHidden,
        data: ['毛薪', '净薪'],
        right: 10,
        top: 0,
        icon: 'circle',
        textStyle: { color: '#64748b' }
      },
      xAxis: {
        type: 'category',
        data: periods.length ? periods : ['无数据'],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#334155', opacity: 0.2 } },
        axisLabel: { show: !isHidden, color: '#94a3b8' }
      },
      series: [
        {
          name: '毛薪',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: isHidden ? [] : grossData,
          itemStyle: { color: '#1241a1' },
          lineStyle: { width: 3 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(18, 65, 161, 0.2)' },
              { offset: 1, color: 'rgba(18, 65, 161, 0)' }
            ])
          }
        },
        {
          name: '净薪',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: isHidden ? [] : netData,
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 3 }
        }
      ]
    };
  });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
</style>