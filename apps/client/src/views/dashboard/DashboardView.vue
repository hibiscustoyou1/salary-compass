<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        title="本年至今净收入"
        :value="`¥${kpi.netIncome.toLocaleString()}`"
        icon="trending_up" iconColor="emerald" trend="+12%" trendLabel="同比去年"
      >
        <template #chart><v-chart class="w-full h-full" :option="incomeTrendOption" autoresize /></template>
      </StatCard>

      <StatCard
        title="已缴税额总计"
        :value="`¥${kpi.taxPaid.toLocaleString()}`"
        icon="account_balance" iconColor="red" trend="有效税率" trendLabel="" trendType="neutral"
      >
        <template #chart>
          <div class="flex flex-col justify-center h-full">
            <div class="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div class="bg-muted-red h-full rounded-full" style="width: 30%"></div>
            </div>
          </div>
        </template>
      </StatCard>

      <StatCard
        title="隐形财富积累"
        :value="`¥${kpi.hiddenWealth.toLocaleString()}`"
        icon="lock_open" iconColor="primary" trend="+5%" trendLabel="增长"
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
        :value="`${kpi.variableRatio}%`"
        icon="donut_small" iconColor="blue" trend="目标: 30%" trendLabel="" trendType="neutral"
      >
        <template #chart><v-chart class="w-full h-full" :option="variableIncomeOption" autoresize /></template>
      </StatCard>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="xl:col-span-2">
        <IncomeTrendChart v-if="chartData" :data="chartData.trend" />
      </div>
      <div>
        <IncomeStructure v-if="chartData" :data="chartData.structure" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CashFlowBreakdown v-if="chartData" :data="chartData.cashFlow" />
      <AssetForecastChart />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  // 按需引入 API 模块
  import { dashboardApi, type DashboardData } from '@/api/dashboard';
  import StatCard from '@/components/dashboard/StatCard.vue';
  import IncomeTrendChart from '@/components/dashboard/IncomeTrendChart.vue';
  import IncomeStructure from '@/components/dashboard/IncomeStructure.vue';
  import CashFlowBreakdown from '@/components/dashboard/CashFlowBreakdown.vue';
  import AssetForecastChart from '@/components/dashboard/AssetForecastChart.vue';

  // 响应式数据状态
  const kpi = ref<DashboardData['cards']>({
    netIncome: 0,
    taxPaid: 0,
    hiddenWealth: 0,
    variableRatio: 0
  });

  const chartData = ref<DashboardData['charts'] | null>(null);

  // ECharts 配置 (Sparklines)
  const incomeTrendOption = ref<any>({
    color: ['#07883b'],
    grid: { left: 0, right: 0, top: 5, bottom: 5 },
    xAxis: { show: false, type: 'category' },
    yAxis: { show: false, min: 'dataMin' },
    series: [{
      type: 'line',
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2 },
      areaStyle: { opacity: 0.1, color: '#07883b' },
      data: [] // 待填充
    }]
  });

  const variableIncomeOption = ref<any>({
    color: ['#60a5fa', '#e5e7eb'],
    series: [{
      type: 'pie',
      radius: ['70%', '90%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: [] // 待填充
    }]
  });

  onMounted(async () => {
    try {
      const res = await dashboardApi.getOverview();
      if (res.code === 200) {
        const d = res.data;
        kpi.value = d.cards;
        chartData.value = d.charts;

        // 更新小图表数据
        incomeTrendOption.value = {
          ...incomeTrendOption.value,
          series: [{ ...incomeTrendOption.value.series[0], data: d.charts.trend.gross }]
        };

        variableIncomeOption.value = {
          ...variableIncomeOption.value,
          series: [{
            ...variableIncomeOption.value.series[0],
            data: [
              { value: d.cards.variableRatio, name: 'Variable' },
              { value: 100 - d.cards.variableRatio, name: 'Fixed', itemStyle: { color: 'rgba(229,231,235,0.5)' } }
            ]
          }]
        };
      }
    } catch (e) {
      console.error('Dashboard data load failed:', e);
    }
  });
</script>

<style scoped>
/* Scoped styles if needed */
</style>