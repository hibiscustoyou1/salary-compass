<template>
  <div
    @click="store.toggleProvidentModal(true)"
    class="bg-card-light dark:bg-card-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-soft hover:shadow-md transition-all group relative cursor-pointer hover:border-primary/50 dark:hover:border-primary/50"
    title="点击管理公积金资产"
  >
    <div class="flex justify-between items-start mb-2">
      <div class="flex items-center gap-1">
        <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">公积金余额</p>
        <span class="material-symbols-outlined text-[16px] text-text-secondary-light" title="基于校准值和薪资流水估算">help</span>
      </div>
      <div>
        <span class="material-symbols-outlined text-primary bg-primary/10 p-1 rounded text-lg">domain</span>
      </div>
    </div>
    <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ masked(store.providentFundBalance) }}</h3>
    <div class="flex items-center gap-2">
      <span class="text-xs text-emerald-custom bg-emerald-custom/10 px-1.5 py-0.5 rounded font-medium">+{{ store.lastYearInterest }}</span>
      <span class="text-text-secondary-light dark:text-text-secondary-dark text-xs">上年度结息</span>
    </div>
    <div class="h-10 mt-3 w-full opacity-50 group-hover:opacity-100 transition-opacity">
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
    const chartData = store.providentFundTrend;
    return {
      grid: { top: 0, bottom: 0, left: 0, right: 0 },
      xAxis: { show: false, type: 'category', data: chartData.map((_, i) => i) },
      yAxis: { show: false, min: 'dataMin' },
      series: [{
        type: 'line', smooth: true, showSymbol: false, data: chartData,
        lineStyle: { color: '#1241a1', width: 2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(18, 65, 161, 0.2)' }, { offset: 1, color: 'rgba(18, 65, 161, 0)' }] } }
      }]
    };
  });
</script>