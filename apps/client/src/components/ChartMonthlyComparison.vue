<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
    <div class="flex justify-between items-center mb-6 pl-2 border-l-4 border-indigo-500">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-100">
        月度收入同比分析
      </h2>
      <div class="flex items-center gap-2">
        <span v-if="isPrivacyMode" class="text-xs text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded">
          隐私模式
        </span>
        <span class="text-xs text-gray-400 dark:text-gray-500 font-normal">
          VueUiXy
        </span>
      </div>
    </div>

    <div class="w-full overflow-hidden">
      <VueUiXy
        :key="configKey"
        :dataset="dataset"
        :config="config"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { VueUiXy } from "vue-data-ui";
  import "vue-data-ui/style.css";
  import type { WageData } from "@/api/wageService";
  import { useTheme } from "@/views/dashboard/composables/useTheme";

  const props = defineProps<{
    data: WageData[];
    isPrivacyMode: boolean;
  }>();

  const { isDark } = useTheme();


  // --- 1. 数据清洗工具 ---
  const parseValue = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (typeof val === 'string') {
      const clean = val.replace(/[^\d.-]/g, '');
      const num = Number(clean);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  // --- 2. 数据转换 (dataset for VueUiXy) ---
  const dataset = computed(() => {
    // 提取所有年份并排序
    const years = Array.from(new Set(props.data.map(item => item.year))).sort((a, b) => a - b);

    return years.map((year, index) => {
      // 初始化 12 个月的数据为 0
      const seriesValues = new Array(12).fill(0);

      // 填充实际数据
      const yearData = props.data.filter(item => item.year === year);
      yearData.forEach(item => {
        seriesValues[item.month - 1] = parseValue(item.netPay);
      });

      return {
        name: `${year}年`,
        series: seriesValues,
        type: "line" as const, // 指定为折线图
        smooth: true, // 平滑曲线
        useArea: false, // 不填充区域
      };
    });
  });

  // 强制刷新 Key (当主题或数据长度变化时重建图表)
  const configKey = computed(() => `xy-${isDark.value}-${dataset.value.length}`);

  // --- 3. 配置生成 (Config for VueUiXy) ---
  const config = computed(() => {
    // 颜色变量定义
    const c_bg = isDark.value ? '#1f2937' : '#ffffff';
    const c_text = isDark.value ? '#CCCCCC' : '#4B5563';
    const c_grid = isDark.value ? '#374151' : '#E5E7EB';
    const c_tooltip_bg = isDark.value ? '#111827' : '#FFFFFF';
    const c_tooltip_border = isDark.value ? '#374151' : '#E5E7EB';

    return {
      chart: {
        backgroundColor: c_bg,
        color: c_text,
        fontFamily: "inherit",
        padding: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        },
        grid: {
          stroke: c_grid,
          showVerticalLines: true,
          labels: {
            color: c_text,
            fontSize: 12,
            // X轴标签：固定为12个月
            xAxisLabels: {
              color: '#CCCCCC',
              values: [
                1735689600000,
                1738368000000,
                1740787200000,
                1743465600000,
                1746057600000,
                1748736000000,
                1751328000000,
                1754006400000,
                1756684800000,
                1759276800000,
                1761955200000,
                1764547200000,
                1767225600000,
                1769904000000,
                1772323200000,
                1775001600000,
                1777593600000,
                1780272000000,
                1782864000000,
                1785542400000,
                1788220800000
              ],
              datetimeFormatter: {
                enable: true,
                locale: 'zh-cn' as const,
                options: {
                  month: 'MMM'
                }
              }
            }
          }
        },
        tooltip: {
          show: true,
          backgroundColor: c_tooltip_bg,
          color: c_text,
          border: `1px solid ${c_tooltip_border}`,
          borderRadius: 4,
        },
        legend: {
          color: c_text,
          fontSize: 12
        },
        title: {
          show: false // 使用外部标题
        },
        zoom: {
          show: true,
          color: c_text,
          highlightColor: isDark.value ? '#4B5563' : '#BFDBFE'
        },
        userOptions: {
          show: true,
          buttons: {
            pdf: true,
            img: true,
            fullscreen: true
          },
          buttonTitles: {
            open: "打开选项",
            close: "关闭选项",
            pdf: "下载 PDF",
            img: "下载图片",
            fullscreen: "全屏显示"
          }
        }
      },
      // 柱状图配置 (虽然未用，但保留默认值防止报错)
      bar: {
        borderRadius: 2,
        useGradient: true
      },
      // 折线图配置
      line: {
        radius: 4,
        strokeWidth: 3,
        dot: {
          useSerieColor: true,
          radius: 4,
          strokeWidth: 2
        }
      },
      // Y轴配置
      showYAxis: true,
      yAxis: {
        label: {
          text: "实发工资",
          color: c_text,
          fontSize: 12,
          width: 60
        },
        grid: {
          stroke: c_grid,
          showHorizontalLines: true
        },
        scale: {
          min: 0,
          max: null // 自动计算最大值
        }
      }
    };
  });
</script>
