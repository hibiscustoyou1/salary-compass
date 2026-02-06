<template>
  <div class="max-w-[1200px] mx-auto flex flex-col gap-6 pb-10" v-if="isActive">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="flex flex-col justify-between gap-4 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-5 shadow-soft">
        <div class="flex items-center justify-between">
          <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">公积金总额</p>
          <span class="material-symbols-outlined text-text-secondary-light text-[20px]">savings</span>
        </div>
        <div>
          <p class="text-emerald-custom text-3xl font-bold tracking-tight transition-all duration-300">{{ masked(formattedProjectedAssets) }}</p>
          <div class="flex items-center gap-1 mt-1">
            <span class="material-symbols-outlined text-emerald-custom text-[14px]">trending_up</span>
            <span class="text-xs text-emerald-custom font-medium">基于当前策略预测</span>
          </div>
        </div>
      </div>
      <div class="flex flex-col justify-between gap-4 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-5 shadow-soft">
        <div class="flex items-center justify-between">
          <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">月度福利缴纳</p>
          <span class="material-symbols-outlined text-text-secondary-light text-[20px]">account_balance_wallet</span>
        </div>
        <div>
          <p class="text-text-main-light dark:text-white text-3xl font-bold tracking-tight">{{ masked('¥4,700') }}</p>
          <p class="text-xs text-text-secondary-light mt-1 font-medium">包含个人与企业部分</p>
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
          <h2 class="text-text-main-light dark:text-white text-lg font-bold">资产增长曲线</h2>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-[#1241a1]"></div><span class="text-xs text-text-secondary-light dark:text-text-secondary-dark">基本养老</span></div>
            <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-[#60a5fa]"></div><span class="text-xs text-text-secondary-light dark:text-text-secondary-dark">企业年金</span></div>
            <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-[#10b981]"></div><span class="text-xs text-text-secondary-light dark:text-text-secondary-dark">公积金</span></div>
          </div>
        </div>

        <AssetGrowthChart :rate="returnRate" :retirement-age="retirementAge" :privacy-mode="privacyMode" />
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
            <div class="flex justify-between text-xs text-text-secondary-light"><span>1%</span><span>10%</span></div>
          </div>
          <div class="flex flex-col gap-3">
            <div class="flex justify-between items-end">
              <label class="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">计划退休年龄</label>
              <span class="text-lg font-bold text-primary">{{ retirementAge }}岁</span>
            </div>
            <input type="range" v-model.number="retirementAge" min="50" max="75" step="1" class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary">
            <div class="flex justify-between text-xs text-text-secondary-light"><span>50岁</span><span>75岁</span></div>
          </div>

          <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
            <p class="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
              <span class="font-bold">提示：</span> 延迟退休可显著增加复利积累时间。每延迟退休3年，最终资产预计增加约 <span class="font-bold">18%</span>。
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <h2 class="text-text-main-light dark:text-white text-lg font-bold px-1">福利构成明细</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="(item, idx) in welfareDetails" :key="idx"
             class="flex flex-col gap-3 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-5 shadow-soft hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-opacity-20" :class="`bg-${item.color}-100 dark:bg-${item.color}-900/20 text-${item.color}-600 dark:text-${item.color}-400`">
              <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
            </div>
            <h3 class="text-text-main-light dark:text-white font-medium">{{ item.title }}</h3>
          </div>
          <div class="space-y-2 mt-1">
            <div class="flex justify-between text-sm">
              <span class="text-text-secondary-light dark:text-text-secondary-dark">{{ item.meta.label }}</span>
              <span class="text-text-main-light dark:text-white font-medium">{{ item.meta.value }}</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
              <div class="h-2 rounded-full" :class="`bg-${item.color}-500`" :style="{ width: item.progress + '%' }"></div>
            </div>
            <div class="flex justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
              <span>状态</span>
              <span>{{ item.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { BENEFITS_DATA } from '@/api/mock';
  import AssetGrowthChart from '@/components/charts/AssetGrowthChart.vue';

  const props = defineProps<{
    isActive: boolean;
    privacyMode: boolean;
  }>();

  const returnRate = ref(4.5);
  const retirementAge = ref(65);
  const welfareDetails = BENEFITS_DATA.details;

  // 简单的预测公式：展示大数
  const formattedProjectedAssets = computed(() => {
    const base = 5800000;
    const years = Math.max(0, retirementAge.value - 32);
    const rate = 1 + (returnRate.value / 100);
    const val = base * Math.pow(rate, years);
    return '¥' + Math.floor(val).toLocaleString();
  });

  const masked = (val: string) => props.privacyMode ? '****' : val;
</script>