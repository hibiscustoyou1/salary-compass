<template>
  <div class="max-w-[1400px] mx-auto flex flex-col gap-6" v-if="isActive">

    <ProvidentFundModal />

    <DashboardHeader />

    <div v-if="dashboardStore.isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCardNetIncome />
        <StatCardTax />
        <StatCardProvident />
        <StatCardAnnuity />
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <IncomeTrendSection />
        <IncomeStructureSection />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useDashboardStore } from '@/stores/dashboard.store.ts';

  // 引入子组件
  import ProvidentFundModal from '@/views/dashboard/components/ProvidentFundModal.vue';
  import DashboardHeader from './components/DashboardHeader.vue';
  import StatCardNetIncome from './components/StatCardNetIncome.vue';
  import StatCardTax from './components/StatCardTax.vue';
  import StatCardProvident from './components/StatCardProvident.vue';
  import StatCardAnnuity from './components/StatCardAnnuity.vue';
  import IncomeTrendSection from './components/IncomeTrendSection.vue';
  import IncomeStructureSection from './components/IncomeStructureSection.vue';

  defineProps<{
    isActive: boolean;
  }>();

  const dashboardStore = useDashboardStore();

  // 初始化逻辑保留在主视图
  onMounted(() => {
    dashboardStore.initDashboard();
  });
</script>