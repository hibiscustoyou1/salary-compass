<template>
  <div class="w-full h-[250px]">
    <v-chart class="w-full h-full" :option="chartOption" autoresize />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  const props = defineProps<{
    gross: number; // 应发
    deductions: {
      pension: number;
      medical: number;
      unemployment: number;
      fund: number;
      tax: number;
    };
    net: number; // 实发
  }>();

  const chartOption = computed(() => {
    const { pension, medical, unemployment, fund, tax } = props.deductions;

    // 瀑布图逻辑：总额 -> 扣除项 -> 余额
    // 辅助占位数据 (用于把柱子顶上去)
    const placeholderData = [
      0, // 应发 (从0开始)
      props.gross - pension, // 扣养老
      props.gross - pension - medical, // 扣医疗
      props.gross - pension - medical - unemployment, // 扣失业
      props.gross - pension - medical - unemployment - fund, // 扣公积金
      props.net, // 扣个税 (剩下位置就是Net)
      0 // 实发 (从0开始)
    ];

    // 实际数值数据
    const valueData = [
      props.gross,
      pension,
      medical,
      unemployment,
      fund,
      tax,
      props.net
    ];

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const target = params[1]; // 获取实际数据系列
          return `${target.name}<br/>${target.name === '应发合计' || target.name === '实发工资' ? '' : '-' }¥${target.value}`;
        }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        splitLine: { show: false },
        data: ['应发合计', '养老', '医疗', '失业', '公积金', '个税', '实发工资'],
        axisLabel: { interval: 0, fontSize: 11, color: '#64748b' }
      },
      yAxis: {
        type: 'value',
        show: false // 保持界面简洁
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
            formatter: (p: any) => `¥${p.value >= 1000 ? (p.value/1000).toFixed(1)+'k' : p.value}`
          },
          data: valueData.map((item, index) => {
            // 样式逻辑：收入蓝，扣除红，实发绿
            if (index === 0) return { value: item, itemStyle: { color: '#1241a1', borderRadius: [4, 4, 0, 0] } };
            if (index === 6) return { value: item, itemStyle: { color: '#07883b', borderRadius: [4, 4, 0, 0] } };
            return { value: item, itemStyle: { color: '#ef4444', opacity: 0.8, borderRadius: [2, 2, 2, 2] } };
          })
        }
      ]
    };
  });
</script>