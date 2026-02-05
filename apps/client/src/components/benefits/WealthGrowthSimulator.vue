<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 flex flex-col rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark p-6 shadow-sm min-h-[400px]">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-text-main-light dark:text-white text-lg font-bold">资产增长曲线</h2>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-[#1241a1]"></div>
            <span class="text-xs text-text-secondary-light font-medium">基本养老金</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-[#60a5fa]"></div>
            <span class="text-xs text-text-secondary-light font-medium">企业年金</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-[#10b981]"></div>
            <span class="text-xs text-text-secondary-light font-medium">公积金</span>
          </div>
        </div>
      </div>

      <div class="flex-1 w-full min-h-0 relative">
        <v-chart class="w-full h-full" :option="chartOption" autoresize />
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <div class="flex flex-col rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark p-6 shadow-sm h-full">
        <div class="flex items-center gap-2 mb-6">
          <span class="material-symbols-outlined text-primary">tune</span>
          <h2 class="text-text-main-light dark:text-white text-lg font-bold">策略参数调整</h2>
        </div>

        <div class="flex flex-col gap-8 flex-1 justify-center">
          <div class="flex flex-col gap-3">
            <div class="flex justify-between items-end">
              <label class="text-sm font-medium text-text-secondary-light">年化收益率预测</label>
              <span class="text-lg font-bold text-primary font-display">{{ params.returnRate }}%</span>
            </div>
            <input
              type="range"
              min="1" max="10" step="0.1"
              v-model.number="params.returnRate"
              class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div class="flex justify-between text-xs text-gray-400 font-display">
              <span>1%</span>
              <span>10%</span>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <div class="flex justify-between items-end">
              <label class="text-sm font-medium text-text-secondary-light">计划退休年龄</label>
              <span class="text-lg font-bold text-primary font-display">{{ params.retireAge }}岁</span>
            </div>
            <input
              type="range"
              min="50" max="75" step="1"
              v-model.number="params.retireAge"
              class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div class="flex justify-between text-xs text-gray-400 font-display">
              <span>50</span>
              <span>75</span>
            </div>
          </div>

          <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <p class="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
              <span class="font-bold">提示：</span> 延迟退休 3 年可使最终退休资产增加约 <span class="font-bold">18%</span>。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, computed } from 'vue';
  import * as echarts from 'echarts/core';

  // 初始参数
  const params = reactive({
    returnRate: 4.5,
    retireAge: 65,
    currentAge: 33 // 假设当前年龄
  });

  // 简单的复利生成函数
  const generateData = (rate: number, years: number, base: number, monthlyAdd: number) => {
    const data = [];
    let current = base;
    for (let i = 0; i <= years; i++) {
      data.push(Math.round(current));
      // 简单按年计算复利 + 年增量
      current = current * (1 + rate / 100) + (monthlyAdd * 12);
    }
    return data;
  };

  const chartOption = computed(() => {
    const yearsToRetire = params.retireAge - params.currentAge;
    const xAxisData = Array.from({length: yearsToRetire + 1}, (_, i) => 2024 + i);

    // 模拟三部分资产增长 (Rate 受 slider 影响)
    // 1. 公积金 (增长最快)
    const fundData = generateData(params.returnRate, yearsToRetire, 320000, 4000);
    // 2. 企业年金 (中等)
    const annuityData = generateData(params.returnRate * 0.9, yearsToRetire, 150000, 2000);
    // 3. 基本养老 (较慢)
    const pensionData = generateData(3.0, yearsToRetire, 180000, 1500);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#9ca3af' }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } },
        axisLabel: { formatter: (val: number) => (val / 10000).toFixed(0) + 'w' }
      },
      series: [
        {
          name: '公积金',
          type: 'line',
          stack: 'Total',
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 0 },
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.1)' }
            ])
          },
          itemStyle: { color: '#10b981' },
          data: fundData
        },
        {
          name: '企业年金',
          type: 'line',
          stack: 'Total',
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 0 },
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#60a5fa' },
              { offset: 1, color: 'rgba(96, 165, 250, 0.1)' }
            ])
          },
          itemStyle: { color: '#60a5fa' },
          data: annuityData
        },
        {
          name: '基本养老金',
          type: 'line',
          stack: 'Total',
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 0 },
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#1241a1' },
              { offset: 1, color: 'rgba(18, 65, 161, 0.1)' }
            ])
          },
          itemStyle: { color: '#1241a1' },
          data: pensionData
        }
      ]
    };
  });
</script>

<style scoped>
/* Slider Styles matching design */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #fff;
  border: 4px solid currentColor;
  margin-top: -4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
input[type=range]::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 4px;
}
</style>