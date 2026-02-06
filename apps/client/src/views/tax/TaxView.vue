<template>
  <div v-if="taxData" class="flex flex-col gap-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between h-36">
        <div class="flex items-start justify-between">
          <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">年度累计个税</p>
          <div class="bg-muted-red/10 p-1.5 rounded-md">
            <span class="material-symbols-outlined text-muted-red text-[20px]">money_off</span>
          </div>
        </div>
        <h3 class="text-3xl font-bold text-muted-red tracking-tight">¥{{ taxData.cards.totalTax.toLocaleString() }}</h3>
      </div>

      <div class="bg-white dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between h-36">
        <div class="flex items-start justify-between">
          <p class="text-text-secondary-light text-sm font-medium">综合税负率</p>
          <div class="bg-primary/10 p-1.5 rounded-md">
            <span class="material-symbols-outlined text-primary text-[20px]">percent</span>
          </div>
        </div>
        <div class="flex items-end justify-between">
          <h3 class="text-3xl font-bold text-text-main-light dark:text-white">{{ taxData.cards.effectiveRate }}%</h3>
          <TaxGauge :percent="taxData.cards.effectiveRate * 4" /> </div>
      </div>

      <div class="bg-white dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between h-36">
        <div class="flex items-start justify-between">
          <p class="text-text-secondary-light text-sm font-medium">专项扣除已抵税</p>
          <div class="bg-emerald/10 p-1.5 rounded-md">
            <span class="material-symbols-outlined text-emerald text-[20px]">savings</span>
          </div>
        </div>
        <h3 class="text-3xl font-bold text-emerald tracking-tight">¥{{ taxData.cards.taxSaved.toLocaleString() }}</h3>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <TaxBracketChart :data="taxData.chart" />
      </div>

      <div class="flex flex-col gap-6">
        <DeductionPieChart :data="taxData.deductionStructure" />

        <div class="bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border border-blue-100 dark:border-slate-700 shadow-sm p-6 relative overflow-hidden flex-1">
          <div class="absolute top-0 right-0 p-4 opacity-10">
            <span class="material-symbols-outlined text-6xl text-primary">lightbulb</span>
          </div>
          <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-primary text-[24px]">tips_and_updates</span>
            <h3 class="text-base font-bold text-text-main-light dark:text-white">税务优化建议</h3>
          </div>
          <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            基于当前税率，建议关注 <span class="font-bold text-primary">专项附加扣除</span> 的填报时效，特别是租金与赡养老人项，可有效降低跳档风险。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  // 按需引入 API 模块
  import { taxApi, type TaxData } from '@/api/tax';
  import TaxGauge from '@/components/tax/TaxGauge.vue';
  import TaxBracketChart from '@/components/tax/TaxBracketChart.vue';
  import DeductionPieChart from '@/components/tax/DeductionPieChart.vue';

  const taxData = ref<TaxData | null>(null);

  onMounted(async () => {
    try {
      const res = await taxApi.getAnalysis();
      if (res.code === 200) {
        taxData.value = res.data;
      }
    } catch (e) {
      console.error('Failed to fetch tax data', e);
    }
  });
</script>

<style scoped>
</style>