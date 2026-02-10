<template>
  <div class="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-soft flex flex-col">
    <h3 class="text-lg font-bold text-text-main-light dark:text-white mb-1">收入结构健康度</h3>
    <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">年度薪酬构成比例</p>

    <div class="flex-1 flex flex-col justify-center gap-6">
      <div v-if="dashboardStore.incomeStructure.length === 0" class="flex items-center justify-center h-full text-text-secondary-light text-sm">
        暂无本年度数据
      </div>
      <div v-else v-for="(item, idx) in dashboardStore.incomeStructure" :key="idx" class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="font-medium text-text-main-light dark:text-white">{{ item.label }}</span>
          <span class="font-bold" :class="item.colorText">{{ masked(item.value) }}</span>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div class="h-full rounded-full transition-all duration-1000" :class="item.colorClass" :style="{ width: item.percent }"></div>
        </div>
      </div>
    </div>

    <div class="mt-6 pt-4 border-t border-border-light dark:border-border-dark">
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">年度总薪酬</span>
        <span class="text-xl font-black text-text-main-light dark:text-white">{{ masked(dashboardStore.totalAnnualGross) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useDashboardStore } from '@/stores/dashboard.store';
  import { useUIStore } from '@/stores/ui.store';

  const dashboardStore = useDashboardStore();
  const uiStore = useUIStore();
  const masked = (val: string) => uiStore.isPrivacyMode ? '****' : val;
</script>