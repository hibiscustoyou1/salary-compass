<template>
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
      <BaseEChart :options="chartOption" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import * as echarts from 'echarts';
  import { useWageStore } from '@/stores/wage.store';
  import { useDashboardStore } from '@/stores/dashboard.store';
  import { useUIStore } from '@/stores/ui.store';
  import BaseEChart from '@/components/charts/BaseEChart.vue';

  const wageStore = useWageStore();
  const dashboardStore = useDashboardStore();
  const uiStore = useUIStore();

  const chartOption = computed(() => {
    const isHidden = uiStore.isPrivacyMode;
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
      tooltip: { trigger: 'axis', formatter: isHidden ? '****' : undefined },
      legend: {
        show: !isHidden,
        data: ['毛薪', '净薪'],
        right: 10, top: 0, icon: 'circle',
        textStyle: { color: '#64748b' }
      },
      xAxis: {
        type: 'category', data: periods.length ? periods : ['无数据'],
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#334155', opacity: 0.2 } },
        axisLabel: { show: !isHidden, color: '#94a3b8' }
      },
      series: [
        {
          name: '毛薪', type: 'line', smooth: true, showSymbol: false,
          data: isHidden ? [] : grossData,
          itemStyle: { color: '#1241a1' }, lineStyle: { width: 3 },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(18, 65, 161, 0.2)' }, { offset: 1, color: 'rgba(18, 65, 161, 0)' }]) }
        },
        {
          name: '净薪', type: 'line', smooth: true, showSymbol: false,
          data: isHidden ? [] : netData,
          itemStyle: { color: '#10b981' }, lineStyle: { width: 3 }
        }
      ]
    };
  });
</script>