<template>
  <div class="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6 flex flex-col h-[400px]">
    <div class="flex flex-wrap items-center justify-between mb-2">
      <div>
        <h3 class="text-base font-bold text-text-main-light dark:text-white">个税跳档趋势分析</h3>
        <p class="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">累计应纳税所得额 vs 月度扣税</p>
      </div>
      <div class="flex items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full bg-primary"></div>
          <span class="text-text-secondary-light">累计所得额</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 bg-muted-red rounded-sm"></div>
          <span class="text-text-secondary-light">月度扣税</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-4 h-0 border-t border-dashed border-gray-400"></div>
          <span class="text-text-secondary-light">税率临界点</span>
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

  // 模拟数据：6月份发生跳档（累计超过14.4万，税率从10%跳到20%）
  // 假设月均应纳税所得额 2.5万
  const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  const cumulativeIncome = [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000];
  // 税计算简化逻辑：
  // 0-36k: 3%
  // 36k-144k: 10%
  // 144k-300k: 20%
  const monthlyTax = [
    750, // 2.5w * 3%
    2500, // (1.1w * 3% + 1.4w * 10%) -> 简化模拟: 2500 (进入10%档)
    2500,
    2500,
    2500,
    4500, // 累计15w，突破14.4w。部分10%，部分20%。税额激增。
    5000, // 全额20%
    5000, 5000, 5000, 5000, 5000
  ];

  const chartOption = ref({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    grid: { left: '2%', right: '2%', bottom: '5%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: months,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: '#9ca3af' }
    },
    yAxis: [
      {
        type: 'value',
        name: '累计所得 (元)',
        position: 'left',
        splitLine: { show: true, lineStyle: { type: 'dashed', color: '#e5e7eb' } },
        axisLabel: { formatter: '{value}' }
      },
      {
        type: 'value',
        name: '月扣税 (元)',
        position: 'right',
        splitLine: { show: false },
        axisLabel: { formatter: '{value}' }
      }
    ],
    series: [
      {
        name: '累计应纳税所得额',
        type: 'line',
        yAxisIndex: 0,
        data: cumulativeIncome,
        smooth: true,
        symbolSize: 8,
        itemStyle: { color: '#1241a1' },
        lineStyle: { width: 3 },
        markLine: {
          symbol: ['none', 'none'],
          label: { show: true, position: 'insideEndTop', formatter: '{b}' },
          data: [
            { yAxis: 36000, name: '3% 临界线 (3.6w)', lineStyle: { color: '#9ca3af', type: 'dashed' } },
            { yAxis: 144000, name: '10% 临界线 (14.4w)', lineStyle: { color: '#ef4444', type: 'dashed', width: 2 } }
          ]
        }
      },
      {
        name: '月度扣税额',
        type: 'bar',
        yAxisIndex: 1,
        data: monthlyTax,
        barWidth: '40%',
        itemStyle: {
          color: (params: any) => {
            // 6月份跳档，标红
            if (params.dataIndex === 5) return '#d32f2f';
            return 'rgba(211, 47, 47, 0.4)'; // 默认浅红
          },
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  });
</script>