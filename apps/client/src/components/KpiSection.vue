<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <div
      v-for="(item, index) in kpiItems"
      :key="index"
      class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between transition-colors duration-300"
    >
      <div>
        <div class="flex justify-between items-start">
          <div class="text-gray-500 dark:text-gray-400 text-sm">{{ item.label }}</div>
          <span
            class="text-[10px] px-2 py-0.5 rounded"
            :class="item.tagClass"
          >
            {{ item.tagText }}
          </span>
        </div>
        <div
          class="text-2xl font-bold mt-2"
          :class="item.textClass"
        >
          {{ isPrivacyMode ? '******' : item.valueDisplay }}
        </div>
      </div>
      <div class="h-[60px] w-full mt-4">
        <VueUiSparkline :dataset="item.dataset" :config="getConfig(item.lineColor)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { VueUiSparkline } from 'vue-data-ui';
  import type { WageData } from '../api/wageService';

  const props = defineProps<{
    data: WageData[];
    isPrivacyMode: boolean;
  }>();

  // --- KPI 计算逻辑 ---
  const avgNetPay = computed(() => props.data.length ? (props.data.reduce((acc, cur) => acc + (cur.netPay || 0), 0) / props.data.length).toFixed(0) : 0);
  const totalGrossPay = computed(() => props.data.reduce((acc, cur) => acc + (cur.grossPay || 0), 0).toFixed(0));
  const totalTax = computed(() => props.data.reduce((acc, cur) => acc + (cur.tax || 0), 0).toFixed(0));
  const avgNetRatio = computed(() => {
    const totalNet = props.data.reduce((acc, cur) => acc + (cur.netPay || 0), 0);
    const totalGross = props.data.reduce((acc, cur) => acc + (cur.grossPay || 0), 0);
    return totalGross === 0 ? 0 : ((totalNet / totalGross) * 100).toFixed(1);
  });

  // --- Sparkline 数据准备 ---
  const getSparkData = (getValue: (item: WageData) => number) => {
    return props.data.map(item => ({
      period: `${item.year}-${item.month}`,
      value: getValue(item)
    }));
  };

  const sparkNetPay = computed(() => getSparkData(i => i.netPay || 0));
  const sparkGrossPay = computed(() => getSparkData(i => i.grossPay || 0));
  const sparkTax = computed(() => getSparkData(i => i.tax || 0));
  const sparkRatio = computed(() => getSparkData(i => (i.grossPay ? (i.netPay / i.grossPay) * 100 : 0)));

  // --- 整合数据用于 v-for ---
  const kpiItems = computed(() => [
    {
      label: '平均月实发',
      tagText: '真金白银',
      tagClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      valueDisplay: `¥ ${Number(avgNetPay.value).toLocaleString()}`,
      dataset: sparkNetPay.value,
      lineColor: '#10b981'
    },
    {
      label: '总计税前总包',
      tagText: '名义薪资',
      tagClass: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      textClass: 'text-blue-600 dark:text-blue-400',
      valueDisplay: `¥ ${Number(totalGrossPay.value).toLocaleString()}`,
      dataset: sparkGrossPay.value,
      lineColor: '#3b82f6'
    },
    {
      label: '平均到手率',
      tagText: '效率',
      tagClass: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
      textClass: 'text-teal-600 dark:text-teal-400',
      valueDisplay: `${avgNetRatio.value}%`,
      dataset: sparkRatio.value,
      lineColor: '#0d9488'
    },
    {
      label: '累计纳税',
      tagText: '纳税光荣',
      tagClass: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      textClass: 'text-orange-500 dark:text-orange-400',
      valueDisplay: `¥ ${Number(totalTax.value).toLocaleString()}`,
      dataset: sparkTax.value,
      lineColor: '#f97316'
    }
  ]);

  // --- Sparkline 配置工厂 ---
  // 注意：这里 Sparkline 背景是透明的，主要关注线条颜色，已通过参数传入
  const getConfig = (color: string) => ({
    type: "line" as const,
    style: {
      backgroundColor: "transparent",
      fontFamily: "inherit",
      animation: {
        show: true,
        animationFrames: 360
      },
      line: {
        color: color,
        strokeWidth: 3,
        smooth: true
      },
      area: {
        show: true,
        useGradient: true,
        opacity: 20,
        color: color
      },
      dataLabel: { show: false },
      title: { show: false },
      zeroLine: { color: "transparent" },
      plot: { show: false }
    }
  });
</script>
