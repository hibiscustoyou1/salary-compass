<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        title="本年至今净收入"
        value="¥142,500"
        icon="trending_up"
        iconColor="emerald"
        trend="+12%"
        trendLabel="同比去年"
      >
        <template #chart>
          <v-chart class="w-full h-full" :option="incomeTrendOption" autoresize />
        </template>
      </StatCard>

      <StatCard
        title="已缴税额总计"
        value="¥68,200"
        icon="account_balance"
        iconColor="red"
        trend="32% 有效税率"
        trendLabel=""
        trendType="neutral"
      >
        <template #chart>
          <div class="flex flex-col justify-center h-full">
            <div class="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div class="bg-muted-red h-full rounded-full" style="width: 32%"></div>
            </div>
          </div>
        </template>
      </StatCard>

      <StatCard
        title="隐形财富积累"
        value="¥45,000"
        icon="lock_open"
        iconColor="primary"
        trend="+5%"
        trendLabel="增长"
      >
        <template #chart>
          <div class="flex items-end gap-1 h-full pb-1">
            <div class="w-1/6 bg-primary/30 h-[40%] rounded-t-sm"></div>
            <div class="w-1/6 bg-primary/40 h-[50%] rounded-t-sm"></div>
            <div class="w-1/6 bg-primary/50 h-[45%] rounded-t-sm"></div>
            <div class="w-1/6 bg-primary/60 h-[70%] rounded-t-sm"></div>
            <div class="w-1/6 bg-primary/80 h-[85%] rounded-t-sm"></div>
            <div class="w-1/6 bg-primary h-[95%] rounded-t-sm"></div>
          </div>
        </template>
      </StatCard>

      <StatCard
        title="浮动收入占比"
        value="25%"
        icon="donut_small"
        iconColor="blue"
        trend="目标: 30%"
        trendLabel=""
        trendType="neutral"
      >
        <template #chart>
          <v-chart class="w-full h-full" :option="variableIncomeOption" autoresize />
        </template>
      </StatCard>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="xl:col-span-2">
        <IncomeTrendChart />
      </div>
      <div>
        <IncomeStructure />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CashFlowBreakdown />

      <AssetForecastChart />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import StatCard from '@/components/dashboard/StatCard.vue';
  import IncomeTrendChart from '@/components/dashboard/IncomeTrendChart.vue';
  import IncomeStructure from '@/components/dashboard/IncomeStructure.vue';
  import CashFlowBreakdown from '@/components/dashboard/CashFlowBreakdown.vue';
  import AssetForecastChart from '@/components/dashboard/AssetForecastChart.vue'; // 引入新组件

  // ... (IncomeTrendOption 等其他配置保持不变) ...
  const incomeTrendOption = ref({
    color: ['#07883b'],
    grid: { left: 0, right: 0, top: 5, bottom: 5 },
    xAxis: { show: false, type: 'category', data: ['A','B','C','D','E','F','G'] },
    yAxis: { show: false, min: 'dataMin' },
    series: [{
      data: [12, 18, 14, 25, 18, 30, 35],
      type: 'line',
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2 },
      areaStyle: {
        opacity: 0.1,
        color: '#07883b'
      }
    }]
  });

  const variableIncomeOption = ref({
    color: ['#60a5fa', '#e5e7eb'],
    series: [
      {
        name: 'Ratio',
        type: 'pie',
        radius: ['70%', '90%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        data: [
          { value: 25, name: 'Variable' },
          { value: 75, name: 'Fixed', itemStyle: { color: 'rgba(229,231,235,0.5)' } }
        ]
      }
    ]
  });
</script>