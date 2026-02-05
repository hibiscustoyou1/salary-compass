<template>
  <div class="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm h-full flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h3 class="text-lg font-bold text-text-main-light dark:text-white">长期资产积累</h3>
        <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">未来5年财富增长预测</p>
      </div>
      <span class="material-symbols-outlined text-text-secondary-light cursor-pointer hover:text-primary transition-colors">more_horiz</span>
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
    grid: { left: '2%', right: '2%', top: '10%', bottom: '0%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}年: ¥{c}'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false, // 贴边显示
      data: ['2024', '2025', '2026', '2027', '2028'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 12,
        margin: 15
      }
    },
    yAxis: {
      type: 'value',
      show: false, // 隐藏Y轴，保持设计稿的简洁感
      min: 'dataMin'
    },
    series: [
      {
        name: '总资产',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: true, // 显示数据点
        itemStyle: {
          color: '#fff',
          borderColor: '#07883b',
          borderWidth: 2
        },
        lineStyle: {
          color: '#07883b',
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(7, 136, 59, 0.2)' }, // 设计稿中的绿色渐变起始
            { offset: 1, color: 'rgba(7, 136, 59, 0)' }   // 渐变结束
          ])
        },
        data: [180000, 240000, 310000, 420000, 580000] // 模拟预测数据
      }
    ]
  });
</script>