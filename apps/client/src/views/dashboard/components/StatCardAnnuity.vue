<template>
  <div class="bg-card-light dark:bg-card-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-soft hover:shadow-md transition-all group">
    <div class="flex justify-between items-start mb-2">
      <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">企业年金积累 (全量)</p>
      <span class="material-symbols-outlined text-blue-400 bg-blue-400/10 p-1 rounded text-lg">savings</span>
    </div>
    <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ masked(store.dashboardStats.annuityAccumulated) }}</h3>
    <div class="flex items-center gap-2">
      <span class="text-text-secondary-light dark:text-text-secondary-dark text-xs">公司4:1配比 | 个人x5</span>
    </div>
    <div class="h-10 mt-3 w-full opacity-50 group-hover:opacity-100 transition-opacity flex items-center justify-center relative">
      <BaseEChart v-if="!uiStore.isPrivacyMode" :options="chartOption" />
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

  const chartOption = computed(() => {
    const chartData = store.annuityTrend;
    return {
      grid: { top: 0, bottom: 0, left: 0, right: 0 },
      xAxis: { show: false, type: 'category', data: chartData.map((_, i) => i) },
      yAxis: { show: false, min: 'dataMin' },
      series: [{
        type: 'line', smooth: true, showSymbol: false, data: chartData,
        lineStyle: { color: '#60a5fa', width: 2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(96, 165, 250, 0.2)' }, { offset: 1, color: 'rgba(96, 165, 250, 0)' }] } }
      }]
    };
  });
</script>