<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
  import * as echarts from 'echarts';

  const props = defineProps<{
    options: any; // ECharts Option
    theme?: string | object;
  }>();

  const chartRef = ref<HTMLElement | null>(null);
  let chartInstance: echarts.ECharts | null = null;

  const initChart = () => {
    if (!chartRef.value) return;
    // 销毁旧实例以支持主题切换
    if (chartInstance) {
      chartInstance.dispose();
    }

    chartInstance = echarts.init(chartRef.value, props.theme);
    chartInstance.setOption(props.options);

    window.addEventListener('resize', handleResize);
  };

  const handleResize = () => {
    chartInstance?.resize();
  };

  watch(() => props.options, (newVal) => {
    chartInstance?.setOption(newVal);
  }, { deep: true });

  // 监听主题变化
  watch(() => props.theme, () => {
    nextTick(initChart);
  });

  onMounted(() => {
    initChart();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    chartInstance?.dispose();
  });
</script>