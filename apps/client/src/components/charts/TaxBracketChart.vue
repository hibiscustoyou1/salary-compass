<template>
  <div class="w-full h-[300px]">
    <BaseEChart :options="chartOptions" :theme="isDark ? 'dark' : undefined" />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from 'vue';
  import BaseEChart from '@/components/charts/BaseEChart.vue';
  import { TAX_BRACKETS } from '@/api/mock';

  const props = defineProps<{
    data: Array<{ month: string; accumulated: number; currentRate: number }>;
    privacyMode: boolean;
  }>();

  const isDark = ref(document.documentElement.classList.contains('dark'));
  let observer: MutationObserver | null = null;

  onMounted(() => {
    observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === 'class') {
          isDark.value = document.documentElement.classList.contains('dark');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  });

  onUnmounted(() => observer?.disconnect());

  const chartOptions = computed(() => {
    if (props.privacyMode) {
      return {
        backgroundColor: 'transparent',
        graphic: {
          type: 'text', left: 'center', top: 'center',
          style: {
            text: '****\n数据已隐藏',
            font: 'bold 24px sans-serif',
            fill: isDark.value ? '#94a3b8' : '#cbd5e1',
            textAlign: 'center'
          }
        }
      };
    }

    const xAxisData = props.data.map(d => d.month);
    const seriesData = props.data.map(d => d.accumulated);

    // 构造个税阶梯线
    const markLines = TAX_BRACKETS.slice(0, 3).map(bracket => ({
      yAxis: bracket.limit,
      label: {
        formatter: `${bracket.rate}% 税率线`,
        position: 'insideEndTop',
        color: isDark.value ? '#ef4444' : '#ef4444',
        fontSize: 10
      },
      lineStyle: {
        type: 'dashed',
        color: isDark.value ? '#ef4444' : '#ef4444',
        opacity: 0.6
      }
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const item = params[0];
          const rate = props.data[item.dataIndex].currentRate;
          return `${item.name}<br/>累计应纳税: <b>¥${item.value.toLocaleString()}</b><br/>当前适用税率: <b>${rate}%</b>`;
        },
        backgroundColor: isDark.value ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: isDark.value ? '#334155' : '#e2e8f0',
        textStyle: { color: isDark.value ? '#f8fafc' : '#0f172a' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: isDark.value ? '#94a3b8' : '#64748b' }
      },
      yAxis: {
        type: 'value',
        name: '累计应纳税所得额',
        nameTextStyle: { align: 'right', padding: [0, 10, 0, 0] },
        splitLine: {
          lineStyle: { type: 'dashed', color: isDark.value ? '#334155' : '#e2e8f0' }
        },
        axisLabel: {
          formatter: (value: number) => (value / 10000).toFixed(0) + '万',
          color: isDark.value ? '#94a3b8' : '#64748b'
        }
      },
      series: [
        {
          name: '累计收入',
          type: 'bar',
          data: seriesData,
          itemStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#1241a1' },
                { offset: 1, color: '#60a5fa' }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          },
          markLine: {
            symbol: 'none',
            data: markLines,
            silent: true
          }
        }
      ]
    };
  });
</script>