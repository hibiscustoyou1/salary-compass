<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
    <div class="flex justify-between items-center mb-6 pl-2 border-l-4 border-teal-500">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-100">
        {{ year === 0 ? '年度全口径收入构成' : `${year}年 月度收入构成` }}
      </h2>
      <div class="flex items-center gap-2">
        <span v-if="isPrivacyMode" class="text-xs text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded">
          隐私模式
        </span>
        <span class="text-xs text-gray-400 dark:text-gray-500 font-normal">
          Donut Evolution
        </span>
      </div>
    </div>

    <div v-if="dataset.length > 0 && hasValidData" class="w-full overflow-x-auto">
      <div class="min-w-[600px]">
        <VueUiDonutEvolution
          :key="configKey"
          :dataset="dataset"
          :config="config"
        />
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center h-[200px] text-gray-400 text-sm">
      <span class="mb-2">📊</span>
      <span>该时间段暂无详细数据</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { VueUiDonutEvolution } from 'vue-data-ui';
  import type { WageData } from '@/api/wageService';
  import { useTheme } from "@/views/dashboard/composables/useTheme";

  const props = defineProps<{
    data: WageData[],
    year: number,
    isPrivacyMode: boolean
  }>();

  const { isDark } = useTheme();

  // --- 1. 数据清洗 ---
  const parseValue = (val: any): number => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (typeof val === 'string') {
      const clean = val.replace(/[^\d.-]/g, '');
      const num = Number(clean);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  // --- 2. 生成时间轴元数据 ---
  const timelineMeta = computed(() => {
    if (props.year === 0) {
      const uniqueYears = Array.from(new Set(props.data.map(i => i.year))).sort((a, b) => a - b);
      return uniqueYears.map(y => ({
        label: String(y),
        year: y,
        month: null
      }));
    } else {
      return Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        return {
          label: `${props.year}-${String(m).padStart(2, '0')}`,
          year: props.year,
          month: m
        };
      });
    }
  });

  const configKey = computed(() => `evo-${props.year}-${timelineMeta.value.length}-${isDark.value ? 'dark' : 'light'}`);

  // --- 3. Dataset 生成 ---
  const dataset = computed(() => {
    const meta = timelineMeta.value;
    if (meta.length === 0) return [];

    const aggregates = meta.map(timePoint => {
      let targetData: WageData[] = [];
      if (props.year === 0) {
        targetData = props.data.filter(i => i.year === timePoint.year);
      } else {
        targetData = props.data.filter(i => i.year === timePoint.year && i.month === timePoint.month);
      }

      return targetData.reduce((acc, cur) => {
        const base = parseValue((cur as any).baseSalary);
        const merit = parseValue((cur as any).meritPay);
        const quarter = parseValue((cur as any).quarterlyBonus);
        const annual = parseValue((cur as any).annualBonus);
        const gross = parseValue(cur.grossPay);
        const other = Math.max(0, gross - (base + merit + quarter + annual));

        return {
          base: acc.base + base,
          merit: acc.merit + merit,
          quarter: acc.quarter + quarter,
          annual: acc.annual + annual,
          other: acc.other + other
        };
      }, { base: 0, merit: 0, quarter: 0, annual: 0, other: 0 });
    });

    return [
      { name: "岗位工资", values: aggregates.map(a => a.base) },
      { name: "绩效工资", values: aggregates.map(a => a.merit) },
      { name: "季度奖金", values: aggregates.map(a => a.quarter) },
      { name: "年终奖金", values: aggregates.map(a => a.annual) },
      { name: "其他补贴", values: aggregates.map(a => a.other) }
    ];
  });

  const hasValidData = computed(() => {
    return dataset.value.some(series => series.values.some(v => v > 0));
  });

  // --- 4. Config 配置 ---
  const config = computed(() => {
    // 基础颜色定义
    const bgColor = isDark.value ? '#1f2937' : '#ffffff';
    const textColor = isDark.value ? '#E5E7EB' : '#4B5563';
    const gridColor = isDark.value ? '#374151' : '#E5E7EB';
    const lineColor = isDark.value ? '#374151' : '#e5e7eb';
    const tooltipBg = isDark.value ? '#111827' : '#ffffff';
    const tooltipText = isDark.value ? '#f3f4f6' : '#333333';

    // 弹窗特有颜色 (稍微深一点以区分层级)
    const dialogBg = isDark.value ? '#111827' : '#ffffff';

    const xAxisValues = timelineMeta.value.map(t => t.label);

    const xAxisConfig = {
      show: true,
      color: textColor,
      fontSize: 12,
      offsetY: 0,
      values: xAxisValues
    };

    return {
      style: {
        fontFamily: "inherit",
        chart: {
          backgroundColor: bgColor,
          color: textColor,

          // 【修复重点】内层弹窗的深度配置
          dialog: {
            show: true,
            backgroundColor: dialogBg, // 弹窗背景
            color: textColor,
            header: {
              backgroundColor: dialogBg,
              color: textColor
            },
            // 内嵌甜甜圈图的样式
            donutChart: {
              style: {
                chart: {
                  backgroundColor: dialogBg,
                  color: textColor,
                  legend: {
                    backgroundColor: dialogBg,
                    color: textColor
                  },
                  tooltip: {
                    show: !props.isPrivacyMode,
                    backgroundColor: tooltipBg, // 内层 Tooltip 背景
                    color: tooltipText,         // 内层 Tooltip 文字
                    borderRadius: 4,
                    borderColor: gridColor,
                    borderWidth: 1
                  },
                  layout: {
                    labels: {
                      percentage: { color: textColor },
                      name: { color: textColor },
                      hollow: {
                        average: { color: textColor, value: { color: textColor } },
                        total: { color: textColor, value: { color: textColor } }
                      }
                    }
                  }
                }
              }
            }
          },

          layout: {
            height: 320,
            width: 800,
            grid: {
              show: true,
              size: 90,
              xAxis: {
                dataLabels: xAxisConfig
              },
              yAxis: {
                dataLabels: {
                  show: true,
                  color: textColor,
                  fontSize: 12
                }
              }
            },
            line: {
              show: true,
              color: lineColor,
              strokeWidth: 2
            },
            dataLabels: {
              show: !props.isPrivacyMode,
              fontSize: 10,
              color: textColor,
              filter: (val: number, total: number) => (val / total) * 100 > 0
            }
          },

          grid: {
            stroke: gridColor,
            show: true,
            xAxis: {
              dataLabels: xAxisConfig
            },
            yAxis: {
              dataLabels: {
                color: textColor
              }
            }
          },

          padding: { top: 20, right: 120, bottom: 20, left: 20 },

          legend: {
            show: true,
            backgroundColor: bgColor,
            color: textColor,
          },
          // 外层 Tooltip 配置
          tooltip: {
            show: !props.isPrivacyMode,
            backgroundColor: tooltipBg,
            background: tooltipBg,
            border: `1px solid ${gridColor}`,
            color: tooltipText,
            borderRadius: 4
          }
        },
        colors: ["#6366f1", "#a855f7", "#ec4899", "#f97316", "#9ca3af"]
      }
    };
  });
</script>
