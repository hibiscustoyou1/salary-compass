<template>
  <div v-if="data" class="flex flex-col gap-6 pb-10">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <BenefitSummaryCard
        title="公积金总额"
        icon="savings"
        :value="`¥${data.summary.fundTotal.toLocaleString()}`"
        value-color="text-emerald"
        trend-icon="trending_up"
        trend-color="text-emerald"
        sub-text="+12.5% 较上年预测"
      />
      <BenefitSummaryCard
        title="月度福利缴纳"
        icon="account_balance_wallet"
        :value="`¥${data.summary.monthlyPayment.toLocaleString()}`"
        sub-text="包含个人与企业部分"
      />
      <BenefitSummaryCard
        title="预计退休年龄"
        icon="event"
        :value="String(data.summary.defaultRetireAge)"
        unit="岁"
        sub-text="默认基准"
      />
    </div>

    <WealthGrowthSimulator :base="data.simulatorBase" />

    <div class="flex flex-col gap-4">
      <h2 class="text-text-main-light dark:text-white text-lg font-bold px-1">福利构成明细</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BenefitDetailCard
          title="基本医疗保险"
          icon="medical_services"
          icon-bg-class="bg-blue-50 text-primary dark:bg-blue-900/20 dark:text-blue-400"
          label1="个人账户余额"
          :value1="`¥${data.details.medical.personal.toLocaleString()}`"
          highlight-color-class="text-primary dark:text-blue-400"
          :progress="100"
          bar-color-class="bg-primary"
          label2="状态"
          :value2="data.details.medical.status"
        />
        <BenefitDetailCard
          title="失业保险"
          icon="umbrella"
          icon-bg-class="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
          label1="累计缴纳"
          :value1="`${data.details.unemployment.months} 个月`"
          highlight-color-class="text-text-main-light dark:text-white"
          :progress="data.details.unemployment.coverage"
          bar-color-class="bg-orange-500"
          label2="当前覆盖率"
          :value2="`${data.details.unemployment.coverage}%`"
        />
        <BenefitDetailCard
          title="工伤与生育"
          icon="health_and_safety"
          icon-bg-class="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
          label1="保障状态"
          value1="已激活"
          highlight-color-class="text-text-main-light dark:text-white"
          :progress="100"
          bar-color-class="bg-purple-500"
          label2="企业预估缴纳"
          :value2="`¥${data.details.injury.amount.toLocaleString()}`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  // 按需引入 API 模块
  import { benefitsApi, type BenefitsData } from '@/api/benefits';
  import BenefitSummaryCard from '@/components/benefits/BenefitSummaryCard.vue';
  import BenefitDetailCard from '@/components/benefits/BenefitDetailCard.vue';
  import WealthGrowthSimulator from '@/components/benefits/WealthGrowthSimulator.vue';

  const data = ref<BenefitsData | null>(null);

  onMounted(async () => {
    try {
      const res = await benefitsApi.getPrediction();
      if (res.code === 200) {
        data.value = res.data;
      }
    } catch (e) {
      console.error('Failed to fetch benefits data', e);
    }
  });
</script>

<style scoped>
</style>