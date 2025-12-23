<template>
  <div class="space-y-6 animate-fade-in">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartEfficiency :data="filteredData" :is-privacy-mode="isPrivacyMode" />
      <ChartDeduction :data="filteredData" :is-privacy-mode="isPrivacyMode" />
    </div>

    <ChartInsurance :data="filteredData" :is-privacy-mode="isPrivacyMode" />
  </div>
</template>

<script setup lang="ts">
  import type { WageData } from '@/api/wageService';

  // 引入相关的图表组件
  // 注意：请确保你的组件都在 src/components 下，如果不是请调整路径
  import ChartEfficiency from '@/components/ChartEfficiency.vue';
  import ChartDeduction from '@/components/ChartDeduction.vue';
  import ChartInsurance from '@/components/ChartInsurance.vue';

  // 接收父组件(SalaryDashboard)传来的数据
  defineProps<{
    filteredData: WageData[]; // 当前年份的数据 (用于展示详情)
    fullData: WageData[];     // 所有年份数据 (备用)
    selectedYear: number;     // 当前选中的年份
    isPrivacyMode: boolean;   // 隐私模式状态
  }>();
</script>

<style scoped>
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
