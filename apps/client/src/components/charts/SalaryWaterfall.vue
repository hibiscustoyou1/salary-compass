<template>
  <div class="w-full h-[300px]">
    <BaseEChart :options="chartOptions" :theme="isDark ? 'dark' : undefined" />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from 'vue';
  import BaseEChart from '@/components/charts/BaseEChart.vue';

  const props = defineProps<{
    gross: string;
    deductions: Record<string, string>;
    net: string;
    privacyMode: boolean;
  }>();

  // --- Fix: Make isDark reactive to DOM changes ---
  const isDark = ref(document.documentElement.classList.contains('dark'));
  let observer: MutationObserver | null = null;

  onMounted(() => {
    // 初始化
    isDark.value = document.documentElement.classList.contains('dark');

    // 监听 html class 变化
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          isDark.value = document.documentElement.classList.contains('dark');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  });

  onUnmounted(() => {
    observer?.disconnect();
  });
  // ------------------------------------------------

  const parse = (v: string) => parseFloat(String(v).replace(/[^0-9.-]+/g, "")) || 0;

  const chartOptions = computed(() => {
    // 1. Privacy Mode Logic
    if (props.privacyMode) {
      return {
        backgroundColor: 'transparent', // Fix background
        graphic: {
          type: 'text',
          left: 'center',
          top: 'center',
          style: {
            text: '****\n数据已隐藏',
            font: 'bold 24px sans-serif',
            fill: isDark.value ? '#94a3b8' : '#cbd5e1', // Adapt text color
            textAlign: 'center'
          }
        }
      };
    }

    const grossVal = parse(props.gross);
    const netVal = parse(props.net);

    const categories = ['应发合计'];
    const values = [grossVal];
    const types = ['gross'];

    let currentHeight = grossVal;
    const placeholderData = [0];

    Object.entries(props.deductions).forEach(([key, valStr]) => {
      const val = parse(valStr);
      categories.push(key);
      values.push(val);
      types.push('deduction');

      currentHeight -= val;
      placeholderData.push(currentHeight);
    });

    categories.push('实发工资');
    values.push(netVal);
    types.push('net');
    placeholderData.push(0);

    return {
      backgroundColor: 'transparent', // Fix: Force transparent background
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = params[1];
          if (!item) return '';
          const val = item.value;
          const name = item.name;
          const prefix = types[item.dataIndex] === 'deduction' ? '-' : '';
          return `${name}<br/><b>${prefix}¥${val.toLocaleString()}</b>`;
        },
        // Ensure tooltip looks good in both modes (optional, echarts default is usually okay)
        backgroundColor: isDark.value ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: isDark.value ? '#334155' : '#e2e8f0',
        textStyle: {
          color: isDark.value ? '#f8fafc' : '#0f172a'
        }
      },
      grid: {
        left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        splitLine: { show: false },
        axisLabel: { interval: 0, fontSize: 11, color: isDark.value ? '#94a3b8' : '#64748b' },
        axisTick: { show: false },
        axisLine: { show: false }
      },
      yAxis: {
        type: 'value',
        show: false
      },
      series: [
        {
          name: 'Placeholder',
          type: 'bar',
          stack: 'Total',
          itemStyle: {
            borderColor: 'transparent',
            color: 'transparent'
          },
          emphasis: {
            itemStyle: { borderColor: 'transparent', color: 'transparent' }
          },
          data: placeholderData
        },
        {
          name: 'Amount',
          type: 'bar',
          stack: 'Total',
          label: {
            show: true,
            position: 'top',
            color: isDark.value ? '#e2e8f0' : '#334155', // Adapt label color
            formatter: (p: any) => {
              const t = types[p.dataIndex];
              const prefix = t === 'deduction' ? '-' : '';
              // Show all labels for clarity, or filter if crowded
              return prefix + (p.value/1000).toFixed(1) + 'k';
            }
          },
          itemStyle: {
            color: (params: any) => {
              const t = types[params.dataIndex];
              if (t === 'gross') return '#1241a1';
              if (t === 'net') return '#10b981';
              return '#ef4444';
            },
            borderRadius: [4, 4, 4, 4]
          },
          data: values
        }
      ]
    };
  });
</script>