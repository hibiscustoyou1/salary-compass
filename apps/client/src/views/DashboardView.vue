<template>
  <div class="max-w-[1400px] mx-auto flex flex-col gap-6" v-if="isActive">
    <div v-if="store.isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="bg-card-light dark:bg-card-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-soft hover:shadow-md transition-all group">
          <div class="flex justify-between items-start mb-2">
            <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">本年至今净收入</p>
            <span class="material-symbols-outlined text-emerald-custom bg-emerald-custom/10 p-1 rounded text-lg">trending_up</span>
          </div>
          <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ masked(store.dashboardStats.netIncomeYTD) }}</h3>
          <div class="flex items-center gap-2">
            <span class="text-emerald-custom text-sm font-semibold bg-emerald-custom/10 px-1.5 py-0.5 rounded">+12%</span>
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
          <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ masked(store.dashboardStats.taxPaid) }}</h3>
          <div class="flex items-center gap-2">
            <span class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">32% 有效税率</span>
          </div>
          <div class="h-10 mt-3 w-full opacity-50 group-hover:opacity-100 transition-opacity">
            <div v-if="!privacyMode" class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
              <div class="bg-red-custom h-full rounded-full" style="width: 32%"></div>
            </div>
            <div v-else class="h-full w-full flex items-center justify-center text-text-secondary-light text-xl tracking-widest font-bold">****</div>
          </div>
        </div>

        <div class="bg-card-light dark:bg-card-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-soft hover:shadow-md transition-all group">
          <div class="flex justify-between items-start mb-2">
            <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">隐形财富积累</p>
            <span class="material-symbols-outlined text-primary bg-primary/10 p-1 rounded text-lg">lock_open</span>
          </div>
          <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ masked(store.dashboardStats.hiddenWealth) }}</h3>
          <div class="flex items-center gap-2">
            <span class="text-emerald-custom text-sm font-semibold bg-emerald-custom/10 px-1.5 py-0.5 rounded">+5%</span>
            <span class="text-text-secondary-light dark:text-text-secondary-dark text-xs">增长</span>
          </div>
          <div class="h-10 mt-3 w-full opacity-50 group-hover:opacity-100 transition-opacity">
            <div v-if="!privacyMode" class="w-full h-full flex items-end gap-1">
              <div v-for="i in 6" :key="i" class="w-1/6 bg-primary rounded-t-sm" :style="{ opacity: 0.3 + (i * 0.1), height: (40 + i * 10) + '%' }"></div>
            </div>
            <div v-else class="h-full w-full flex items-center justify-center text-text-secondary-light text-xl tracking-widest font-bold">****</div>
          </div>
        </div>

        <div class="bg-card-light dark:bg-card-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-soft hover:shadow-md transition-all group">
          <div class="flex justify-between items-start mb-2">
            <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">浮动收入占比</p>
            <span class="material-symbols-outlined text-blue-400 bg-blue-400/10 p-1 rounded text-lg">donut_small</span>
          </div>
          <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ store.dashboardStats.variableIncomeRatio }}</h3>
          <div class="flex items-center gap-2">
            <span class="text-text-secondary-light dark:text-text-secondary-dark text-xs">目标: 30%</span>
          </div>
          <div class="h-10 mt-3 w-full opacity-50 group-hover:opacity-100 transition-opacity flex items-center justify-center relative">
            <svg class="transform -rotate-90" height="40" viewBox="0 0 40 40" width="40">
              <circle cx="20" cy="20" fill="none" r="15.9155" class="stroke-slate-200 dark:stroke-slate-700" stroke-width="4"></circle>
              <circle cx="20" cy="20" fill="none" r="15.9155" class="stroke-primary" stroke-dasharray="25, 100" stroke-width="4"></circle>
            </svg>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <div class="xl:col-span-2 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-soft flex flex-col">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-lg font-bold text-text-main-light dark:text-white">毛收入 vs 净收入趋势</h3>
              <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">比较总薪酬与实际到手收入</p>
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
            <div v-if="store.incomeStructure.length === 0" class="flex items-center justify-center h-full text-text-secondary-light text-sm">
              暂无本年度数据
            </div>
            <div v-else v-for="(item, idx) in store.incomeStructure" :key="idx" class="space-y-2">
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
              <span class="text-xl font-black text-text-main-light dark:text-white">{{ masked(store.totalAnnualGross) }}</span>
            </div>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import BaseEChart from '@/components/charts/BaseEChart.vue';
  import * as echarts from 'echarts';
  import { useWageStore } from '@/stores/wage.store';

  const props = defineProps<{
    isActive: boolean;
    privacyMode: boolean;
  }>();

  const store = useWageStore();

  onMounted(() => {
    store.initData();
  });

  const masked = (val: string) => props.privacyMode ? '****' : val;

  // 迷你折线图配置（KPI卡片用）
  const miniLineOption = computed(() => ({
    grid: { top: 0, bottom: 0, left: 0, right: 0 },
    xAxis: { show: false, type: 'category', data: [1,2,3,4,5,6,7,8] },
    yAxis: { show: false, min: 'dataMin' },
    series: [{
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: [12, 18, 14, 25, 18, 22, 10, 5],
      lineStyle: { color: '#10b981', width: 2 },
    }]
  }));

  // 主趋势图配置（动态基于 store 数据）
  const trendChartOption = computed(() => {
    const isHidden = props.privacyMode;

    // 处理数据：取最近 12 条，反转顺序使时间正序，提取所需字段
    const chartData = store.salaryHistory
      .slice(0, 12)
      .reverse()
      .map(item => ({
        period: item.period.split('-')[1] + '月',
        gross: item.raw.gross,
        net: item.raw.net
      }));

    const periods = chartData.map(d => d.period);
    const grossData = chartData.map(d => d.gross);
    const netData = chartData.map(d => d.net);

    return {
      // 边距配置，给图例和轴标签留出空间
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
        textStyle: {
          color: '#64748b'
        }
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