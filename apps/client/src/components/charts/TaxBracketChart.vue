<template>
  <div class="w-full h-[300px]">
    <BaseEChart :options="chartOptions" :theme="isDark ? 'dark' : undefined" />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from 'vue';
  import BaseEChart from '@/components/charts/BaseEChart.vue';
  import { TAX_BRACKETS } from '@/constants/tax';
  import { useUIStore } from '@/stores/ui.store';

  const props = defineProps<{
    data: Array<{ month: string; accumulated: number; currentRate: number }>;
  }>();

  const uiStore = useUIStore();


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
    // 解包以确保依赖追踪
    const isHidden = uiStore.isPrivacyMode;
    
    // [修正] 隐私模式不再隐藏整个图表，而是脱敏数据
    // 如果 privacyMode 为 true，我们仍然渲染图表，但在 tooltip 和 axisLabel 中进行脱敏

    const xAxisData = props.data.map(d => d.month);
    // [修正] 对于未来月份（accumulated为0），我们可以选择不显示 bar，或者显示 0
    // 这里保持原样显示
    const seriesData = props.data.map(d => d.accumulated);

    // 构造个税阶梯线 (适配新 TAX_BRACKETS 结构: max, rate)
    const markLines = TAX_BRACKETS.slice(0, 3).map(bracket => ({
      yAxis: bracket.max, // 使用 max
      label: {
        formatter: `${(bracket.rate * 100).toFixed(0)}% 税率线`, // rate 是小数 0.03
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
          if (isHidden) return '****'; // [修复] 隐私模式脱敏

          const item = params[0];
          const rate = props.data[item.dataIndex]?.currentRate ?? 0;
          return `${item.name}<br/>累计应纳税: <b>¥${item.value.toLocaleString()}</b><br/>当前适用税率: <b>${rate}%</b>`;
        },
        backgroundColor: isDark.value ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: isDark.value ? '#334155' : '#e2e8f0',
        textStyle: { color: isDark.value ? '#f8fafc' : '#0f172a' }
      },
      grid: { left: '0%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
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
        nameTextStyle: { align: 'left', padding: [0, 0, 0, -20] }, // [调整] 标题位置防止被截断
        minInterval: 10000,
        splitLine: {
          lineStyle: { type: 'dashed', color: isDark.value ? '#334155' : '#e2e8f0' }
        },
        axisLabel: {
          show: true, // [恢复] 总是显示标签
          formatter: (value: number) => isHidden ? '***' : value.toLocaleString(), // [修复] 隐私模式显示 ***
          color: isDark.value ? '#94a3b8' : '#64748b',
          margin: 12 // [微调] 增加标签与轴线的间距
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