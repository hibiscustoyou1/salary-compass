import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSalaryHistory, type SalaryRecord } from '@/api/wage';

export const useWageStore = defineStore('wage', () => {
  const salaryHistory = ref<SalaryRecord[]>([]);
  const isInitialized = ref(false);
  const isLoading = ref(false);

  // 重命名为 fetchHistory，职责更明确
  const fetchHistory = async () => {
    if (isInitialized.value) return;
    isLoading.value = true;
    try {
      const res = await getSalaryHistory();
      if (res.success) {
        salaryHistory.value = res.data;
        isInitialized.value = true;
      }
    } catch (e) {
      console.error('Failed to fetch salary history', e);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    salaryHistory,
    isLoading,
    fetchHistory
  };
});