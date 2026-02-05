<template>
  <div class="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6 flex flex-col h-[300px]">
    <h3 class="text-base font-bold text-text-main-light dark:text-white mb-2">专项扣除构成</h3>

    <div class="flex-1 relative">
      <v-chart class="w-full h-full" :option="chartOption" autoresize />
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-xs text-text-secondary-light">总计扣除</span>
        <span class="font-bold text-lg text-text-main-light dark:text-white">¥6,000/月</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const chartOption = ref({
    color: ['#1241a1', '#3b82f6', '#93c5fd'],
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', icon: 'circle', itemWidth: 8, itemHeight: 8 },
    series: [
      {
        name: '扣除构成',
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        data: [
          { value: 3000, name: '住房租金 (50%)' },
          { value: 1800, name: '婴幼儿照护 (30%)' },
          { value: 1200, name: '赡养老人 (20%)' }
        ]
      }
    ]
  });
</script>