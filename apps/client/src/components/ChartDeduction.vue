<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
    <div class="flex justify-between items-center mb-4 pl-2 border-l-4 border-indigo-500">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-100">扣款分布</h2>
      <div v-if="isPrivacyMode" class="text-xs text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded">
        隐私模式
      </div>
    </div>
    <VueUiDonut
      :key="configKey"
      :dataset="dataset"
      :config="config"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { VueUiDonut } from 'vue-data-ui';
  import type { WageData } from '@/api/wageService';
  import { useTheme } from '@/views/dashboard/composables/useTheme';

  const props = defineProps<{
    data: WageData[],
    isPrivacyMode: boolean
  }>();

  const { isDark } = useTheme();

  // 强制刷新 Key
  const configKey = computed(() => `deduction-${isDark.value ? 'dark' : 'light'}`);

  const dataset = computed(() => {
    const sumData = (key: keyof WageData) => props.data.reduce((acc, cur) => acc + ((cur as any)[key] || 0), 0);
    return [
      { name: '公积金', values: [sumData('housingFund')], color: '#6366f1' },
      { name: '个税', values: [sumData('tax')], color: '#f97316' },
      { name: '养老', values: [sumData('pension')], color: '#3b82f6' },
      { name: '医疗', values: [sumData('medical')], color: '#06b6d4' },
      { name: '年金', values: [sumData('annuity')], color: '#8b5cf6' },
      { name: '其他', values: [sumData('unemployment') + sumData('unionFee')], color: '#9ca3af' },
    ].filter(i => {
      const [val = -1] = i.values;
      return val > 0;
    });
  });

  const config = computed(() => {
    const bgColor = isDark.value ? '#1f2937' : '#ffffff';
    const tooltipBg = isDark.value ? '#111827' : '#ffffff';
    const tooltipText = isDark.value ? '#f3f4f6' : '#333333';
    // 【关键】暗黑模式下使用高亮文字 (#E5E7EB)
    const labelColor = isDark.value ? '#E5E7EB' : '#374151';

    return {
      style: {
        chart: {
          backgroundColor: bgColor,
          color: labelColor, // 1. 全局文字颜色兜底
          useGradient: false,

          legend: {
            show: true,
            backgroundColor: "transparent",
            color: labelColor
          },

          tooltip: {
            show: !props.isPrivacyMode,
            backgroundColor: tooltipBg,
            color: tooltipText,
            border: isDark.value ? '1px solid #374151' : '1px solid #e5e7eb'
          },
          layout: {
            labels: {
              dataLabels: {
                show: !props.isPrivacyMode,
                // 【关键修复】关闭模糊背景，直接显示高亮文字
                useBlur: false,
                color: labelColor, // 2. 显式指定数据标签颜色
                fontSize: 12
              },
              percentage: {
                color: labelColor,
                bold: true
              },
              hollow: {
                total: {
                  show: !props.isPrivacyMode,
                  text: "总扣款",
                  color: labelColor,
                  fontSize: 16,
                  fontWeight: 'bold'
                }
              }
            }
          }
        },
        fontFamily: 'inherit'
      },
      table: { show: false }
    };
  });
</script>
