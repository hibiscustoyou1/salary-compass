<template>
  <div class="flex flex-col gap-3 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark p-5 shadow-sm hover:shadow-md transition-shadow">
    <div class="flex items-center gap-3">
      <div class="p-2 rounded-lg" :class="iconBgClass">
        <span class="material-symbols-outlined text-[20px]">{{ icon }}</span>
      </div>
      <h3 class="text-text-main-light dark:text-white font-medium">{{ title }}</h3>
    </div>

    <div class="space-y-2 mt-1">
      <div class="flex justify-between text-sm">
        <span class="text-text-secondary-light">{{ label1 }}</span>
        <span class="font-medium" :class="highlightColorClass">{{ value1 }}</span>
      </div>

      <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          class="h-2 rounded-full transition-all duration-1000"
          :class="barColorClass"
          :style="{ width: progress + '%' }"
        ></div>
      </div>

      <div class="flex justify-between text-xs text-text-secondary-light mt-1">
        <span>{{ label2 }}</span>
        <span>{{ value2 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    title: string;
    icon: string;
    iconBgClass: string; // e.g. 'bg-blue-50 text-primary'
    label1: string;
    value1: string;
    highlightColorClass?: string; // e.g. 'text-primary'
    progress: number;
    barColorClass: string; // e.g. 'bg-primary'
    label2: string;
    value2: string;
  }>();
</script>