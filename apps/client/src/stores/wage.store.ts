import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSalaryHistory, type SalaryRecord } from '@/api/wage';

export const useWageStore = defineStore('wage', () => {
  const salaryHistory = ref<SalaryRecord[]>([]);
  const isInitialized = ref(false);
  const isLoading = ref(false);

  // 初始化仅获取历史记录，这是所有分析的基础
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