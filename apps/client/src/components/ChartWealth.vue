<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
    <div class="flex justify-between items-center mb-4 pl-2 border-l-4 border-yellow-500">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-100">财富滚雪球</h2>
      <div v-if="isPrivacyMode" class="text-xs text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded">
        隐私模式
      </div>
    </div>
    <VueUiXy
      v-if="dataset.length"
      :key="configKey"
      :dataset="dataset"
      :config="config"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { VueUiXy } from 'vue-data-ui';
  import type { WageData } from '@/api/wageService';
  import { useTheme } from '@/views/dashboard/composables/useTheme';

  const props = defineProps<{
    data: WageData[],
    isPrivacyMode: boolean
  }>();

  const { isDark } = useTheme();

  const configKey = computed(() => `wealth-${isDark.value ? 'dark' : 'light'}`);

  const dataset = computed(() => {
    let cumCash = 0, cumAsset = 0;
    return [
      {
        name: '累计到手现金',
        series: props.data.map(i => { cumCash += (i.netPay || 0); return cumCash; }),
        type: 'line' as const, useArea: true, color: '#10b981'
      },
      {
        name: '累计隐形资产',
        series: props.data.map(i => { cumAsset += ((i.housingFund || 0) + (i.annuity || 0)); return cumAsset; }),
        type: 'line' as const, useArea: true, color: '#3b82f6'
      }
    ];
  });

  const config = computed(() => {
    const bgColor = isDark.value ? '#1f2937' : '#ffffff';
    const textColor = isDark.value ? '#E5E7EB' : '#4B5563';
    const gridColor = isDark.value ? '#374151' : '#E5E7EB';
    const tooltipBg = isDark.value ? '#111827' : '#ffffff';
    const tooltipText = isDark.value ? '#f3f4f6' : '#333333';

    return {
      chart: {
        fontFamily: 'inherit',
        backgroundColor: bgColor,
        height: 300,
        zoom: { show: true },
        padding: { top: 20, right: 20, bottom: 20, left: 60 },

        // 【修复 Bug 1】Tooltip 配置
        tooltip: {
          show: !props.isPrivacyMode, // 只有非隐私模式才显示
          borderRadius: 8,
          backgroundColor: tooltipBg,
          border: `1px solid ${gridColor}`,
          color: tooltipText,
          backgroundOpacity: 90
        },

        // 【修复 Bug 2】图例颜色
        legend: {
          color: textColor, // 显式设置颜色
          fontSize: 12
        },

        grid: {
          stroke: gridColor,
          showVerticalLines: false,
          labels: {
            color: textColor,
            xAxisLabels: {
              show: true,
              color: textColor,
              fontSize: 10,
              values: props.data.map(i => `${i.year}-${String(i.month).padStart(2,'0')}`)
            }
          }
        }
      },
      line: { smooth: true, strokeWidth: 2 },
      yAxis: {
        labels: { show: !props.isPrivacyMode, color: textColor }
      }
    };
  });
</script>
