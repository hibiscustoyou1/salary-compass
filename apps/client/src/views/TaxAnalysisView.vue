<template>
  <div class="max-w-[1400px] mx-auto flex flex-col gap-6" v-if="isActive">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-soft flex flex-col justify-between h-36">
        <div class="flex items-start justify-between">
          <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">年度累计个税</p>
          <div class="bg-red-50 dark:bg-red-900/20 p-1.5 rounded-md">
            <span class="material-symbols-outlined text-red-custom text-[20px]">money_off</span>
          </div>
        </div>
        <div>
          <h3 class="text-3xl font-bold text-red-custom tracking-tight">{{ masked(taxData.kpi.totalTax) }}</h3>
          <div class="flex items-center gap-1 mt-1 text-xs text-text-secondary-light dark:text-text-secondary-dark">
            <span>较去年同期</span>
            <span class="text-red-custom font-medium flex items-center"> {{ taxData.kpi.totalTaxTrend }} <span class="material-symbols-outlined text-[12px]">arrow_upward</span></span>
          </div>
        </div>
      </div>

      <div class="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-soft flex flex-col justify-between h-36 relative overflow-hidden">
        <div class="flex items-start justify-between z-10 relative">
          <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">综合税负率</p>
          <div class="bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-md">
            <span class="material-symbols-outlined text-primary text-[20px]">percent</span>
          </div>
        </div>
        <div class="flex items-end justify-between z-10 relative">
          <div>
            <h3 class="text-3xl font-bold text-text-main-light dark:text-white tracking-tight">{{ privacyMode ? '**' : taxData.kpi.effectiveRate }}%</h3>
            <p class="text-xs text-text-secondary-light mt-1">处于合理优化区间</p>
          </div>
          <div class="relative w-16 h-16 flex items-center justify-center">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
              <circle class="text-slate-100 dark:text-slate-700" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" stroke-width="6"></circle>
              <circle
                v-if="!privacyMode"
                class="text-primary transition-all duration-1000 ease-out"
                cx="32" cy="32" fill="transparent" r="28"
                stroke="currentColor"
                :stroke-dasharray="`${(taxData.kpi.effectiveRate / 100) * 175.9} 175.9`"
                stroke-linecap="round" stroke-width="6">
              </circle>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-soft flex flex-col justify-between h-36">
        <div class="flex items-start justify-between">
          <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">专项附加扣除抵税</p>
          <div class="bg-emerald-custom/10 p-1.5 rounded-md">
            <span class="material-symbols-outlined text-emerald-custom text-[20px]">savings</span>
          </div>
        </div>
        <div>
          <h3 class="text-3xl font-bold text-emerald-custom tracking-tight">{{ masked(taxData.kpi.deductionSavings) }}</h3>
          <div class="flex items-center gap-1 mt-1 text-xs text-text-secondary-light dark:text-text-secondary-dark">
            <span>本财年预计节省总额</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-soft p-6">
        <div class="flex justify-between mb-4">
          <h3 class="font-bold text-text-main-light dark:text-white">个税跳档趋势</h3>
          <span class="text-xs text-text-secondary-light dark:text-text-secondary-dark">临界点预警</span>
        </div>
        <TaxBracketChart :data="taxData.trend" :privacy-mode="privacyMode" />
      </div>

      <div class="bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border border-blue-100 dark:border-slate-700 shadow-soft p-6 relative overflow-hidden flex flex-col justify-center">
        <div class="absolute top-0 right-0 p-4 opacity-10">
          <span class="material-symbols-outlined text-6xl text-primary">lightbulb</span>
        </div>
        <div class="flex items-center gap-2 mb-4 relative z-10">
          <span class="material-symbols-outlined text-primary">tips_and_updates</span>
          <h3 class="font-bold text-text-main-light dark:text-white">税务优化建议</h3>
        </div>
        <div class="flex flex-col gap-3 relative z-10">
          <div class="flex gap-3 items-start p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-blue-100 dark:border-slate-700/50 shadow-sm transition-all hover:shadow-md">
            <span class="material-symbols-outlined text-amber-500 text-[20px] shrink-0">warning</span>
            <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              预计将在 <span class="font-bold text-text-main-light dark:text-white">10月</span> 触达20%税率档位。
            </p>
          </div>
          <div class="flex gap-3 items-start p-3 bg-emerald-custom/5 dark:bg-emerald-900/20 rounded-lg border border-emerald-custom/20 shadow-sm transition-all hover:shadow-md">
            <span class="material-symbols-outlined text-emerald-custom text-[20px] shrink-0">check_circle</span>
            <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              建议将 <span class="font-bold text-emerald-700 dark:text-emerald-400">年终奖</span> 调整至次年1月发放。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { getTaxAnalysisData } from '@/api/mock';
  import TaxBracketChart from '@/components/charts/TaxBracketChart.vue';

  const props = defineProps<{
    isActive: boolean;
    privacyMode: boolean;
  }>();

  const taxData = getTaxAnalysisData();

  const masked = (val: string) => props.privacyMode ? '****' : val;
</script>