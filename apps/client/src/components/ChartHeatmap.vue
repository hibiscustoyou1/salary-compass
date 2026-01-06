<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
    <div class="flex justify-between items-center mb-4 pl-2 border-l-4 border-pink-500">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-100">月度收入热力图</h2>
      <div v-if="isPrivacyMode" class="text-xs text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded">
        隐私模式
      </div>
    </div>
    <div class="w-full overflow-x-auto">
      <div class="min-w-[600px]">
        <VueUiHeatmap :dataset="dataset" :config="config" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { VueUiHeatmap } from 'vue-data-ui';
  import type { WageData } from '../api/wageService';
  import { useTheme } from '@/views/dashboard/composables/useTheme';

  const props = defineProps<{
    data: WageData[],
    isPrivacyMode: boolean
  }>();

  const { isDark } = useTheme();

  const dataset = computed(() => {
    const years = Array.from(new Set(props.data.map(i => i.year))).sort((a, b) => a - b);
    return years.map(year => {
      const monthsData = Array(12).fill(0);
      props.data.filter(d => d.year === year).forEach(d => {
        if (d.month >= 1 && d.month <= 12) {
          monthsData[d.month - 1] = d.grossPay || 0;
        }
      });
      return { name: String(year), values: monthsData };
    });
  });

  const config = computed(() => {
    const bgColor = isDark.value ? '#1f2937' : '#ffffff';
    const textColor = isDark.value ? '#E5E7EB' : '#1f2937'; // 调整为高亮
    const cellGapColor = isDark.value ? '#1f2937' : '#ffffff';
    const tooltipBg = isDark.value ? '#111827' : '#ffffff';
    const tooltipText = isDark.value ? '#f3f4f6' : '#333333';
    const tooltipBorder = isDark.value ? '#374151' : '#ddd';

    return {
      style: {
        backgroundColor: bgColor,
        fontFamily: 'inherit',
        layout: { padding: { left: 40, right: 20 } },
        cells: {
          colors: { hot: '#10b981', cold: isDark.value ? '#064e3b' : '#ecfdf5' },
          gap: 2,
          stroke: cellGapColor,
          strokeWidth: 2
        },
        tooltip: {
          show: !props.isPrivacyMode,
          backgroundColor: tooltipBg,
          color: tooltipText,
          border: `1px solid ${tooltipBorder}`
        }
      },
      xAxis: {
        labels: {
          values: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
          color: textColor // 【关键】X轴颜色
        }
      },
      yAxis: {
        labels: {
          color: textColor // 【关键】Y轴颜色
        }
      }
    };
  });
</script>
