<template>
  <div class="max-w-[1200px] mx-auto flex flex-col gap-6 pb-10" v-if="isActive">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="flex flex-col justify-between gap-4 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-5 shadow-soft">
        <div class="flex items-center justify-between">
          <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">公积金累计估值</p>
          <span class="material-symbols-outlined text-text-secondary-light text-[20px]">savings</span>
        </div>
        <div>
          <p class="text-emerald-custom text-3xl font-bold tracking-tight transition-all duration-300">{{ masked(benefitsStore.benefitsStats.providentFundTotal) }}</p>
          <div class="flex items-center gap-1 mt-1">
            <span class="text-xs text-text-secondary-light">含企业年金: {{ masked(benefitsStore.benefitsStats.annuityTotal) }}</span>
          </div>
        </div>
      </div>
      <div class="flex flex-col justify-between gap-4 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-5 shadow-soft">
        <div class="flex items-center justify-between">
          <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">月度福利投入 (估)</p>
          <span class="material-symbols-outlined text-text-secondary-light text-[20px]">account_balance_wallet</span>
        </div>
        <div>
          <p class="text-text-main-light dark:text-white text-3xl font-bold tracking-tight">{{ masked(benefitsStore.benefitsStats.monthlyContribution) }}</p>
          <p class="text-xs text-text-secondary-light mt-1 font-medium">企业+个人双边总额</p>
        </div>
      </div>
      <div class="flex flex-col justify-between gap-4 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-5 shadow-soft">
        <div class="flex items-center justify-between">
          <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">预计退休年龄</p>
          <span class="material-symbols-outlined text-text-secondary-light text-[20px]">event</span>
        </div>
        <div>
          <p class="text-text-main-light dark:text-white text-3xl font-bold tracking-tight">{{ retirementAge }} <span class="text-lg font-normal text-text-secondary-light">岁</span></p>
          <p class="text-xs text-text-secondary-light mt-1 font-medium">距离退休还有 {{ Math.max(0, retirementAge - 32) }} 年</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 flex flex-col rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-6 shadow-soft">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-text-main-light dark:text-white text-lg font-bold">资产增长曲线 (预测)</h2>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-[#1241a1]"></div><span class="text-xs text-text-secondary-light dark:text-text-secondary-dark">基本养老</span></div>
            <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-[#60a5fa]"></div><span class="text-xs text-text-secondary-light dark:text-text-secondary-dark">企业年金</span></div>
            <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-[#10b981]"></div><span class="text-xs text-text-secondary-light dark:text-text-secondary-dark">公积金</span></div>
          </div>
        </div>

        <AssetGrowthChart
          :rate="returnRate"
          :retirement-age="retirementAge"
          :privacy-mode="privacyMode"
          :initial-provident-fund="benefitsStore.benefitsStats.raw?.providentFundTotal || 0"
          :initial-annuity="benefitsStore.benefitsStats.raw?.annuityTotal || 0"
          :monthly-provident-fund="currentMonthly.provident"
          :monthly-annuity="currentMonthly.annuity"
          :monthly-pension="currentMonthly.pension"
        />
      </div>

      <div class="flex flex-col rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-6 shadow-soft h-full">
        <div class="flex items-center gap-2 mb-6">
          <span class="material-symbols-outlined text-primary">tune</span>
          <h2 class="text-text-main-light dark:text-white text-lg font-bold">策略参数调整</h2>
        </div>
        <div class="flex flex-col gap-8 flex-1 justify-center">
          <div class="flex flex-col gap-3">
            <div class="flex justify-between items-end">
              <label class="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">年化收益率预测</label>
              <span class="text-lg font-bold text-primary">{{ returnRate }}%</span>
            </div>
            <input type="range" v-model.number="returnRate" min="1" max="10" step="0.1" class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary">
          </div>
          <div class="flex flex-col gap-3">
            <div class="flex justify-between items-end">
              <label class="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">计划退休年龄</label>
              <span class="text-lg font-bold text-primary">{{ retirementAge }}岁</span>
            </div>
            <input type="range" v-model.number="retirementAge" min="50" max="75" step="1" class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useBenefitsStore } from '@/stores/benefits.store';
  import AssetGrowthChart from '@/components/charts/AssetGrowthChart.vue';

  const props = defineProps<{
    isActive: boolean;
    privacyMode: boolean;
  }>();

  const benefitsStore = useBenefitsStore();
  const returnRate = ref(4.5);
  const retirementAge = ref(65);

  onMounted(() => {
    benefitsStore.initBenefits();
  });

  const masked = (val: string) => props.privacyMode ? '****' : val;

  // [优雅重构] 直接从后端数据模型取值，保证唯一真实数据源
  const currentMonthly = computed(() => {
    return benefitsStore.benefitsStats.monthlyBreakdown || { provident: 0, annuity: 0, pension: 0 };
  });
</script>