<template>
  <div class="flex flex-col justify-between gap-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark p-5 shadow-sm">
    <div class="flex items-center justify-between">
      <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">{{ title }}</p>
      <span class="material-symbols-outlined text-text-secondary-light text-[20px]">{{ icon }}</span>
    </div>
    <div>
      <p class="font-display text-3xl font-bold tracking-tight" :class="valueColorClass">{{ value }}
        <span v-if="unit" class="text-lg text-text-secondary-light font-normal">{{ unit }}</span>
      </p>
      <div v-if="subText" class="flex items-center gap-1 mt-1">
        <span v-if="trendIcon" class="material-symbols-outlined text-[14px]" :class="trendColorClass">{{ trendIcon }}</span>
        <p class="text-xs font-medium" :class="subTextColorClass">{{ subText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    title: string;
    icon: string;
    value: string;
    unit?: string;
    valueColor?: string; // e.g. 'text-emerald-600'
    subText?: string;
    trendIcon?: string;
    trendColor?: string;
  }>();

  const valueColorClass = computed(() => props.valueColor || 'text-text-main-light dark:text-white');
  const subTextColorClass = computed(() => props.trendColor || 'text-text-secondary-light');
  const trendColorClass = computed(() => props.trendColor || 'text-text-secondary-light');
</script>