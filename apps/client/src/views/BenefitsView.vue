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
          :initial-provident-fund="parse(benefitsStore.benefitsStats.providentFundTotal)"
          :initial-annuity="parse(benefitsStore.benefitsStats.annuityTotal)"
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

    <div class="flex flex-col gap-4">
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

  // [新增] 辅助函数：解析货币字符串 "¥580,000" -> 580000
  const parse = (v: string | undefined) => parseFloat(String(v || '0').replace(/[^0-9.-]+/g, "")) || 0;

  // [新增] 从 details 中提取月度数据 (API 目前返回的是 total, 需要从 details 解析或者让后端直接返回)
  // 暂时从 details 数组反解，或者简单估算。
  // 查看 benefits.controller.ts，monthlyContribution 是总额。
  // 为了更精确，这里先做个简单的反解逻辑，理想情况后端应直接返回 separate monthly data
  const currentMonthly = computed(() => {
    const details = benefitsStore.benefitsStats.details;
    if (!details || details.length < 3) return { provident: 0, annuity: 0, pension: 0 };

    // 假设顺序是固定的: [0]=公积金, [1]=年金, [2]=社保
    // 公积金详情 meta.value: "¥9,400"
    const provStr = details[0]?.meta?.value;
    // 年金详情 meta.value: "¥xxxx" (这里后端其实返回的是余额，暂且假设 store 里能取到月缴)
    // 实际上 controller 里的 meta.value:
    // 公积金 -> latest.housing * 2
    // 年金 -> totalAnnuity (余额，非月缴! 这是一个后端BUG，之前 review 没发现)

    // *修正策略*：暂时先用 parse 解析，如果后端字段含义不对，后续我们在 Step 2 修复后端。
    // 根据 controller 代码:
    // details[0] (公积金) meta.value = latest.housing * 2 (月缴) -> 正确
    // details[1] (年金) meta.value = totalAnnuity (余额) -> *错误*，这里应该是月缴
    // details[2] (社保) meta.value = pension+medical+unemployment (月缴) -> 正确

    const provVal = parse(provStr);
    const pensionVal = parse(details[2]?.meta?.value);

    // 年金月缴暂时估算：假设为公积金的 1/3 (因为公积金是12%+12%，年金是4%+8%左右)
    // 或者我们直接用 monthlyContribution 总额减去其他两项
    const totalMonthly = parse(benefitsStore.benefitsStats.monthlyContribution);
    const annuityVal = Math.max(0, totalMonthly - provVal - pensionVal);

    return {
      provident: provVal,
      annuity: annuityVal,
      pension: pensionVal
    };
  });

</script>