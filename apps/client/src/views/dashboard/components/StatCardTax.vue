<template>
  <div class="bg-card-light dark:bg-card-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-soft hover:shadow-md transition-all group">
    <div class="flex justify-between items-start mb-2">
      <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">已缴税额总计</p>
      <span class="material-symbols-outlined text-red-custom bg-red-custom/10 p-1 rounded text-lg">account_balance</span>
    </div>
    <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ masked(store.dashboardStats.taxPaid) }}</h3>
    <div class="flex items-center gap-2">
      <span class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">{{ store.taxAnalysis.kpi.effectiveRate }}% 有效税率</span>
    </div>
    <div class="h-10 mt-3 w-full opacity-50 group-hover:opacity-100 transition-opacity">
      <div v-if="!uiStore.isPrivacyMode" class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
        <div class="bg-red-custom h-full rounded-full" :style="{ width: store.taxAnalysis.kpi.effectiveRate + '%' }"></div>
      </div>
      <div v-else class="h-full w-full flex items-center justify-center text-text-secondary-light text-xl tracking-widest font-bold">****</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useDashboardStore } from '@/stores/dashboard.store';
  import { useUIStore } from '@/stores/ui.store';

  const store = useDashboardStore();
  const uiStore = useUIStore();
  const masked = (val: string) => uiStore.isPrivacyMode ? '****' : val;
</script>