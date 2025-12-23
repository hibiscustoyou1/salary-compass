<template>
  <div class="space-y-6 animate-fade-in">
    <KpiSection :data="filteredData" :is-privacy-mode="isPrivacyMode" />

    <ChartWealth :data="filteredData" :is-privacy-mode="isPrivacyMode" />

    <SalaryTable
      :data="filteredData"
      :selected-year="selectedYear"
      :is-privacy-mode="isPrivacyMode"
    />
  </div>
</template>

<script setup lang="ts">
  import type { WageData } from '@/api/wageService';
  import KpiSection from '@/components/KpiSection.vue';
  import ChartWealth from '@/components/ChartWealth.vue';
  import SalaryTable from '@/components/SalaryTable.vue';

  defineProps<{
    filteredData: WageData[];
    fullData: WageData[];
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
