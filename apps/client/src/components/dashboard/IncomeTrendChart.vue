<template>
  <div class="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm h-[400px] flex flex-col">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h3 class="text-lg font-bold text-text-main-light dark:text-white">毛收入 vs 净收入趋势</h3>
        <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">比较总薪酬与实际到手收入</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-primary"></span>
          <span class="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">毛薪</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-emerald"></span>
          <span class="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">净薪</span>
        </div>
      </div>
    </div>

    <div class="flex-1 w-full min-h-0">
      <v-chart class="w-full h-full" :option="chartOption" autoresize />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import * as echarts from 'echarts/core';

  const chartOption = ref({
    grid: { left: '2%', right: '2%', top: '10%', bottom: '5%', containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af' }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: { type: 'dashed', color: '#e5e7eb' }
      }
    },
    series: [
      {
        name: '毛薪',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: [20000, 21000, 25000, 22000, 20000, 35000, 28000, 22000, 20000, 23000, 21000, 45000],
        lineStyle: { color: '#1241a1', width: 3 },
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
        data: [14000, 14500, 18000, 15500, 14000, 24000, 19000, 15500, 14000, 16000, 14500, 32000],
        lineStyle: { color: '#07883b', width: 3 },
        itemStyle: { color: '#07883b' }
      }
    ]
  });
</script>