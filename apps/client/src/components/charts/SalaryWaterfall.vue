<template>
  <div class="w-full h-[300px]">
    <BaseEChart :options="chartOptions" :theme="isDark ? 'dark' : undefined" />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from 'vue';
  import BaseEChart from '@/components/charts/BaseEChart.vue';
  import { DEDUCTION_LABELS } from '@repo/shared';

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
    isDark.value = document.documentElement.classList.contains('dark');
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          isDark.value = document.documentElement.classList.contains('dark');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  });

  onUnmounted(() => {
    observer?.disconnect();
  });
  // ------------------------------------------------

  const parse = (v: string) => parseFloat(String(v).replace(/[^0-9.-]+/g, "")) || 0;

  const chartOptions = computed(() => {
    const grossVal = parse(props.gross);
    const netVal = parse(props.net);

    const categories = ['应发合计'];
    const values = [grossVal];
    const types = ['gross'];

    let currentHeight = grossVal;
    const placeholderData = [0];

    // [逻辑修正] 过滤掉仅用于计税的专项附加扣除
    const IGNORED_DEDUCTIONS = ['rentDeduction', 'childCareDeduction'];

    Object.entries(props.deductions).forEach(([key, valStr]) => {
      if (IGNORED_DEDUCTIONS.includes(key)) return;

      const val = parse(valStr);
      // [修复] 中文转义
      categories.push(DEDUCTION_LABELS[key] || key);
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
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = params[1]; // Index 1 is the actual bar, Index 0 is placeholder
          if (!item) return '';

          const val = item.value;
          const name = item.name;
          const prefix = types[item.dataIndex] === 'deduction' ? '-' : '';
          
          // [修复] Privacy Mode: Tooltip 脱敏
          const displayVal = props.privacyMode ? '****' : `¥${val.toLocaleString()}`;
          
          return `${name}<br/><b>${prefix}${displayVal}</b>`;
        },
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
        show: true, // 显式确保显示
        type: 'category',
        data: categories,
        splitLine: { show: false },
        axisLabel: { 
          interval: 0, 
          fontSize: 10,
          rotate: 30, // 保持旋转
          color: isDark.value ? '#94a3b8' : '#64748b',
          hideOverlap: false
        },
        axisTick: { show: false },
        axisLine: { show: false }
      },
      yAxis: {
        show: false, // Y 轴隐藏
        type: 'value'
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
            color: isDark.value ? '#e2e8f0' : '#334155',
            formatter: (p: any) => {
              // [修复] Privacy Mode: 标签脱敏
              if (props.privacyMode) return '****';

              const t = types[p.dataIndex];
              const prefix = t === 'deduction' ? '-' : '';
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
      ],
      graphic: [
        {
          type: 'text',
          right: 10,
          top: 10,
          style: {
            text: '',
            font: '12px sans-serif',
            fill: isDark.value ? '#64748b' : '#94a3b8'
          }
        }
      ]
    };
  });
</script>