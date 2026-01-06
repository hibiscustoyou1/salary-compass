<template>
  <div class="space-y-6 animate-fade-in">
    <ChartStructureEvolution :data="fullData" :year="selectedYear" :is-privacy-mode="isPrivacyMode" />

    <ChartMonthlyComparison :data="fullData" :is-privacy-mode="isPrivacyMode" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartIncomeStructure :data="filteredData" :is-privacy-mode="isPrivacyMode" />
      <ChartHeatmap :data="filteredData" :is-privacy-mode="isPrivacyMode" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { WageData } from '@/api/wageService';
  import ChartIncomeStructure from '@/components/ChartIncomeStructure.vue';
  import ChartStructureEvolution from '@/components/ChartStructureEvolution.vue';
  import ChartHeatmap from '@/components/ChartHeatmap.vue';
  // 【新增】引入新组件
  import ChartMonthlyComparison from '@/components/ChartMonthlyComparison.vue';

  defineProps<{
    filteredData: WageData[];
    fullData: WageData[]; // 确保这里使用了 fullData，因为同比需要跨年数据
    selectedYear: number;
    isPrivacyMode: boolean;
  }>();
</script>

<style scoped>
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
