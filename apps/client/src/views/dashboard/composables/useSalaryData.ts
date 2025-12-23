import { ref } from 'vue';
import { getWageData, type WageData } from '@/api/wageService';

// 定义需要聚合的数值字段类型
type NumericFields = Pick<WageData,
  | 'grossPay' | 'netPay' | 'tax' | 'pension'
  | 'medical' | 'unemployment' | 'housingFund'
  | 'annuity' | 'unionFee' | 'baseSalary'
  | 'meritPay' | 'quarterlyBonus' | 'annualBonus'
>;

// 显式列出这些字段的 key
const AGGREGATE_FIELDS: (keyof NumericFields)[] = [
  'grossPay', 'netPay', 'tax', 'pension', 'medical',
  'unemployment', 'housingFund', 'annuity', 'unionFee',
  'baseSalary', 'meritPay', 'quarterlyBonus', 'annualBonus'
];

export function useSalaryData() {
  const loading = ref(true);
  const fullWageList = ref<WageData[]>([]);
  const availableYears = ref<number[]>([]);
  
  // 数据清洗逻辑 - 类型安全版
  const cleanAndAggregateData = (rawData: WageData[]): WageData[] => {
    const map = new Map<string, WageData>();
    
    rawData.forEach(item => {
      const key = `${item.year}-${item.month}`;
      
      if (!map.has(key)) {
        // 深拷贝对象，避免引用污染
        map.set(key, { ...item });
      } else {
        const existing = map.get(key)!;
        
        // 类型安全的聚合累加
        AGGREGATE_FIELDS.forEach(field => {
          const distinctVal = item[field] || 0;
          const existingVal = existing[field] || 0;
          
          // 确保是数字相加
          if (typeof distinctVal === 'number' && typeof existingVal === 'number') {
            (existing[field] as number) = existingVal + distinctVal;
          }
        });
      }
    });
    
    return Array.from(map.values())
    .filter(item => (item.grossPay || 0) > 0)
    .sort((a, b) => {
      if (a.year === b.year) return a.month - b.month;
      return a.year - b.year;
    });
  };
  
  // 初始化
  const initData = async () => {
    loading.value = true;
    try {
      const rawData = await getWageData();
      const cleanedData = cleanAndAggregateData(rawData);
      fullWageList.value = cleanedData;
      
      // 提取年份并倒序
      const years = new Set(cleanedData.map(item => item.year));
      availableYears.value = Array.from(years).sort((a, b) => b - a);
    } catch (e) {
      console.error("加载数据失败", e);
      // 这里建议添加用户提示，例如使用 Toast
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
