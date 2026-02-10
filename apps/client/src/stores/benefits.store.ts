import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getBenefitsStats, type BenefitsStats } from '@/api/benefits';

export const useBenefitsStore = defineStore('benefits', () => {
  const benefitsStats = ref<BenefitsStats>({
    providentFundTotal: '¥0',
    annuityTotal: '¥0',
    monthlyContribution: '¥0',
    details: []
  });

  const isLoading = ref(false);
  const isInitialized = ref(false);

  const initBenefits = async () => {
    if (isInitialized.value) return;
    isLoading.value = true;
    try {
      const res = await getBenefitsStats();
      if (res.success) {
        benefitsStats.value = res.data;
        isInitialized.value = true;
      }
    } catch (e) {
      console.error('Failed to init benefits data', e);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    benefitsStats,
    isLoading,
    initBenefits
  };
});