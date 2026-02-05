<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between h-36">
        <div class="flex items-start justify-between">
          <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">年度累计个税</p>
          <div class="bg-muted-red/10 p-1.5 rounded-md">
            <span class="material-symbols-outlined text-muted-red text-[20px]">money_off</span>
          </div>
        </div>
        <div>
          <h3 class="text-3xl font-bold text-muted-red tracking-tight">¥12,450</h3>
          <div class="flex items-center gap-1 mt-1 text-xs text-text-secondary-light">
            <span>较去年同期</span>
            <span class="text-muted-red font-medium flex items-center">
               +4.2% <span class="material-symbols-outlined text-[12px]">arrow_upward</span>
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between h-36 relative overflow-hidden">
        <div class="flex items-start justify-between z-10 relative">
          <p class="text-text-secondary-light text-sm font-medium">综合税负率</p>
          <div class="bg-primary/10 p-1.5 rounded-md">
            <span class="material-symbols-outlined text-primary text-[20px]">percent</span>
          </div>
        </div>
        <div class="flex items-end justify-between z-10 relative">
          <div>
            <h3 class="text-3xl font-bold text-text-main-light dark:text-white tracking-tight">8.5%</h3>
            <p class="text-xs text-text-secondary-light mt-1">处于合理优化区间</p>
          </div>
          <TaxGauge :percent="75" />
        </div>
      </div>

      <div class="bg-white dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between h-36">
        <div class="flex items-start justify-between">
          <p class="text-text-secondary-light text-sm font-medium">专项附加扣除已抵税</p>
          <div class="bg-emerald/10 p-1.5 rounded-md">
            <span class="material-symbols-outlined text-emerald text-[20px]">savings</span>
          </div>
        </div>
        <div>
          <h3 class="text-3xl font-bold text-emerald tracking-tight">¥24,000</h3>
          <div class="flex items-center gap-1 mt-1 text-xs text-text-secondary-light">
            <span>本财年预计节省总额</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <TaxBracketChart />
      </div>

      <div class="flex flex-col gap-6">
        <DeductionPieChart />

        <div class="bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border border-blue-100 dark:border-slate-700 shadow-sm p-6 relative overflow-hidden flex-1">
          <div class="absolute top-0 right-0 p-4 opacity-10">
            <span class="material-symbols-outlined text-6xl text-primary">lightbulb</span>
          </div>
          <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-primary text-[24px]">tips_and_updates</span>
            <h3 class="text-base font-bold text-text-main-light dark:text-white">税务优化建议</h3>
          </div>
          <div class="flex flex-col gap-3">
            <div class="flex gap-3 items-start p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-blue-100 dark:border-slate-700/50 shadow-sm">
              <span class="material-symbols-outlined text-orange-500 text-[20px] mt-0.5 shrink-0">warning</span>
              <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                预计将在 <span class="font-bold text-text-main-light dark:text-white">6月</span> 触达20%税率档位。
              </p>
            </div>
            <div class="flex gap-3 items-start p-3 bg-emerald/10 rounded-lg border border-emerald/20 shadow-sm">
              <span class="material-symbols-outlined text-emerald text-[20px] mt-0.5 shrink-0">check_circle</span>
              <p class="text-sm text-text-secondary-light leading-relaxed">
                建议将 <span class="font-bold text-emerald">年终奖</span> 调整至次年1月发放以优化税负。
              </p>
            </div>
          </div>
          <button class="w-full mt-4 py-2 px-4 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center justify-center gap-1">
            查看详细模拟
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import TaxGauge from '@/components/tax/TaxGauge.vue';
  import TaxBracketChart from '@/components/tax/TaxBracketChart.vue';
  import DeductionPieChart from '@/components/tax/DeductionPieChart.vue';
</script>