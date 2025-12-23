import { ref } from 'vue';
import { getWageData, type WageData } from '@/api/wageService';

export function useSalaryData() {
  const loading = ref(true);
  const fullWageList = ref<WageData[]>([]);
  const availableYears = ref<number[]>([]);
  
  // 数据清洗逻辑
  const cleanAndAggregateData = (rawData: WageData[]): WageData[] => {
    const map = new Map<string, WageData>();
    rawData.forEach(item => {
      const key = `${item.year}-${item.month}`;
      if (!map.has(key)) {
        map.set(key, { ...item });
      } else {
        const existing = map.get(key)!;
        const fields = ['grossPay', 'netPay', 'tax', 'pension', 'medical', 'unemployment', 'housingFund', 'annuity', 'unionFee', 'baseSalary', 'meritPay', 'quarterlyBonus', 'annualBonus'];
        fields.forEach(f => { (existing as any)[f] = ((existing as any)[f] || 0) + ((item as any)[f] || 0); });
      }
    });
    return Array.from(map.values())
    .filter(item => (item.grossPay || 0) > 0)
    .sort((a, b) => a.year === b.year ? a.month - b.month : a.year - b.year);
  };
  
  // 初始化
  const initData = async () => {
    loading.value = true;
    try {
      const rawData = await getWageData();
      const cleanedData = cleanAndAggregateData(rawData);
      fullWageList.value = cleanedData;
      const years = new Set(cleanedData.map(item => item.year));
      availableYears.value = Array.from(years).sort((a, b) => b - a);
    } catch (e) {
      console.error("加载失败", e);
    } finally {
      loading.value = false;
    }
  };
  
  return {
    loading,
    fullWageList,
    availableYears,
    initData
  };
}
