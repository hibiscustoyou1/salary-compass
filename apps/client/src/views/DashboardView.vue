<template>
  <div class="max-w-[1400px] mx-auto flex flex-col gap-6" v-if="isActive">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div class="bg-card-light dark:bg-card-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-soft hover:shadow-md transition-all group">
        <div class="flex justify-between items-start mb-2">
          <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">本年至今净收入</p>
          <span class="material-symbols-outlined text-emerald-custom bg-emerald-custom/10 p-1 rounded text-lg overflow-hidden w-7 h-7 flex items-center justify-center select-none">trending_up</span>
        </div>
        <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ masked(kpis.income.value) }}</h3>
        <div class="flex items-center gap-2">
          <span class="text-emerald-custom text-sm font-semibold bg-emerald-custom/10 px-1.5 py-0.5 rounded">{{ kpis.income.trend }}</span>
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
          <span class="material-symbols-outlined text-red-custom bg-red-custom/10 p-1 rounded text-lg overflow-hidden w-7 h-7 flex items-center justify-center select-none">account_balance</span>
        </div>
        <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ masked(kpis.tax.value) }}</h3>
        <div class="flex items-center gap-2">
          <span class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">{{ kpis.tax.trend }}</span>
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
          <span class="material-symbols-outlined text-primary bg-primary/10 p-1 rounded text-lg overflow-hidden w-7 h-7 flex items-center justify-center select-none">lock_open</span>
        </div>
        <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ masked(kpis.wealth.value) }}</h3>
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
          <span class="material-symbols-outlined text-blue-400 bg-blue-400/10 p-1 rounded text-lg overflow-hidden w-7 h-7 flex items-center justify-center select-none">donut_small</span>
        </div>
        <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ kpis.ratio.value }}</h3>
        <div class="flex items-center gap-2">
          <span class="text-text-secondary-light dark:text-text-secondary-dark text-xs">{{ kpis.ratio.trend }}</span>
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
          <div v-for="(item, idx) in incomeStructure" :key="idx" class="space-y-2">
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
            <span class="text-xl font-black text-text-main-light dark:text-white">{{ masked('¥280,000') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { KPI_DATA, INCOME_STRUCTURE } from '@/api/mock';
  import BaseEChart from '@/components/charts/BaseEChart.vue';
  import * as echarts from 'echarts';

  const props = defineProps<{
    isActive: boolean;
    privacyMode: boolean;
  }>();

  const masked = (val: string) => props.privacyMode ? '****' : val;

  const kpis = {
    income: { title: '本年至今净收入', value: KPI_DATA.netIncomeYTD.value, trend: KPI_DATA.netIncomeYTD.trend },
    tax: { title: '已缴税额总计', value: KPI_DATA.taxPaid.value, trend: '32% 有效税率' },
    wealth: { title: '隐形财富积累', value: KPI_DATA.hiddenWealth.value, trend: KPI_DATA.hiddenWealth.trend },
    ratio: { title: '浮动收入占比', value: KPI_DATA.variableIncomeRatio.value, trend: '目标: 30%' },
  };

  const incomeStructure = INCOME_STRUCTURE.map(i => ({
    ...i,
    colorText: i.label === '固定薪资' ? 'text-primary' : (i.label === '绩效奖金' ? 'text-blue-400' : 'text-emerald-custom'),
    colorClass: i.label === '固定薪资' ? 'bg-primary' : (i.label === '绩效奖金' ? 'bg-blue-400' : 'bg-emerald-custom')
  }));

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

  const trendChartOption = computed(() => {
    const isHidden = props.privacyMode;
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
        textStyle: {
          color: '#64748b'
        }
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
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
          data: isHidden ? [] : [200, 190, 160, 140, 80, 60, 60, 80, 120, 160, 180, 200],
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
          data: isHidden ? [] : [240, 230, 210, 200, 170, 160, 150, 160, 190, 210, 220, 230],
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 3 }
        }
      ]
    };
  });
</script>