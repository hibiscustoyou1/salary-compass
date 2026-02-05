<template>
  <div class="bg-white dark:bg-card-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow group h-full flex flex-col justify-between">
    <div>
      <div class="flex justify-between items-start mb-2">
        <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">{{ title }}</p>
        <span
          class="material-symbols-outlined p-1 rounded text-lg"
          :class="iconClass"
        >{{ icon }}</span>
      </div>
      <h3 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ value }}</h3>
      <div class="flex items-center gap-2">
        <span
          class="text-sm font-semibold px-1.5 py-0.5 rounded"
          :class="trendClass"
        >{{ trend }}</span>
        <span class="text-text-secondary-light dark:text-text-secondary-dark text-xs">{{ trendLabel }}</span>
      </div>
    </div>

    <div class="h-12 mt-3 w-full opacity-80 group-hover:opacity-100 transition-opacity relative">
      <slot name="chart"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    title: string;
    value: string;
    icon: string;
    iconColor: 'emerald' | 'red' | 'primary' | 'blue';
    trend: string;
    trendLabel: string;
    trendType?: 'positive' | 'neutral' | 'negative';
  }>();

  const iconClass = computed(() => {
    const map = {
      emerald: 'text-emerald bg-emerald/10',
      red: 'text-muted-red bg-muted-red/10',
      primary: 'text-primary bg-primary/10',
      blue: 'text-blue-400 bg-blue-400/10'
    };
    return map[props.iconColor];
  });

  const trendClass = computed(() => {
    if (props.trendType === 'neutral') return 'text-text-secondary-light bg-gray-100 dark:bg-gray-800';
    // 默认正向为绿色
    return 'text-emerald bg-emerald/10';
  });
</script>