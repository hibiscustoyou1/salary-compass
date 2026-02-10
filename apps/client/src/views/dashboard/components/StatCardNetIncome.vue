<template>
  <div class="bg-card-light dark:bg-card-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-soft hover:shadow-md transition-all group">
    <div class="flex justify-between items-start mb-2">
      <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">本年至今净收入</p>
      <span class="material-symbols-outlined text-emerald-custom bg-emerald-custom/10 p-1 rounded text-lg">trending_up</span>
    </div>
    <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ masked(store.dashboardStats.netIncomeYTD) }}</h3>
    <div class="flex items-center gap-2">
      <span :class="[
        store.dashboardStats.netIncomeChange.startsWith('-')
          ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
          : 'text-emerald-custom bg-emerald-custom/10',
        'text-sm font-semibold px-1.5 py-0.5 rounded'
      ]">
        {{ store.dashboardStats.netIncomeChange }}
      </span>
      <span class="text-text-secondary-light dark:text-text-secondary-dark text-xs">同比去年</span>
    </div>
    <div class="h-10 mt-3 w-full opacity-50 group-hover:opacity-100 transition-opacity">
      <BaseEChart v-if="!uiStore.isPrivacyMode" :options="miniLineOption" />
      <div v-else class="h-full w-full flex items-center justify-center text-text-secondary-light text-xl tracking-widest font-bold">****</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useDashboardStore } from '@/stores/dashboard.store';
  import { useUIStore } from '@/stores/ui.store';
  import BaseEChart from '@/components/charts/BaseEChart.vue';

  const store = useDashboardStore();
  const uiStore = useUIStore();
  const masked = (val: string) => uiStore.isPrivacyMode ? '****' : val;

  const miniLineOption = computed(() => {
    const data = store.netIncomeMiniChartData;
    const chartData = data.length ? data : [0, 0, 0, 0, 0, 0];
    return {
      grid: { top: 0, bottom: 0, left: 0, right: 0 },
      xAxis: { show: false, type: 'category', data: chartData.map((_, i) => i) },
      yAxis: { show: false, min: 'dataMin' },
      series: [{
        type: 'line', smooth: true, showSymbol: false, data: chartData,
        lineStyle: { color: '#10b981', width: 2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16, 185, 129, 0.2)' }, { offset: 1, color: 'rgba(16, 185, 129, 0)' }] } }
      }]
    };
  });
</script>