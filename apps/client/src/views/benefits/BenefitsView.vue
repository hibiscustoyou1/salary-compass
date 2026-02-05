<template>
  <div class="flex flex-col gap-6 pb-10">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <BenefitSummaryCard
        title="公积金总额"
        icon="savings"
        value="¥5,800,000"
        value-color="text-emerald"
        trend-icon="trending_up"
        trend-color="text-emerald"
        sub-text="+12.5% 较上年预测"
      />
      <BenefitSummaryCard
        title="月度福利缴纳"
        icon="account_balance_wallet"
        value="¥4,700"
        sub-text="包含个人与企业部分"
      />
      <BenefitSummaryCard
        title="预计退休年龄"
        icon="event"
        value="65"
        unit="岁"
        sub-text="距离退休还有 32 年"
      />
    </div>

    <WealthGrowthSimulator />

    <div class="flex flex-col gap-4">
      <h2 class="text-text-main-light dark:text-white text-lg font-bold px-1">福利构成明细</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BenefitDetailCard
          title="基本医疗保险"
          icon="medical_services"
          icon-bg-class="bg-blue-50 text-primary dark:bg-blue-900/20 dark:text-blue-400"
          label1="缴纳状态"
          value1="正常"
          highlight-color-class="text-primary dark:text-blue-400"
          :progress="100"
          bar-color-class="bg-primary"
          label2="企业 8%"
          value2="个人 2%"
        />
        <BenefitDetailCard
          title="失业保险"
          icon="umbrella"
          icon-bg-class="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
          label1="累计缴纳"
          value1="86 个月"
          highlight-color-class="text-text-main-light dark:text-white"
          :progress="85"
          bar-color-class="bg-orange-500"
          label2="当前覆盖率"
          value2="85%"
        />
        <BenefitDetailCard
          title="工伤与生育"
          icon="health_and_safety"
          icon-bg-class="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
          label1="保障额度"
          value1="顶级覆盖"
          highlight-color-class="text-text-main-light dark:text-white"
          :progress="100"
          bar-color-class="bg-purple-500"
          label2="企业全额承担"
          value2="已激活"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import BenefitSummaryCard from '@/components/benefits/BenefitSummaryCard.vue';
  import BenefitDetailCard from '@/components/benefits/BenefitDetailCard.vue';
  import WealthGrowthSimulator from '@/components/benefits/WealthGrowthSimulator.vue';
</script>