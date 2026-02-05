<template>
  <div class="relative w-16 h-16 flex items-center justify-center">
    <svg class="w-full h-full transform -rotate-90">
      <circle
        class="text-gray-100 dark:text-gray-800"
        cx="32" cy="32" r="28"
        fill="transparent"
        stroke="currentColor"
        stroke-width="6"
      ></circle>
      <circle
        class="text-primary transition-all duration-1000 ease-out"
        cx="32" cy="32" r="28"
        fill="transparent"
        stroke="currentColor"
        stroke-width="6"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
      ></circle>
    </svg>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    percent: number; // 0 - 100
  }>();

  const radius = 28;
  const circumference = 2 * Math.PI * radius; // ≈ 175.9

  const dashOffset = computed(() => {
    // 设计稿是全圆，但只显示进度。
    // offset = circumference * (1 - percent/100)
    const p = Math.min(Math.max(props.percent, 0), 100);
    return circumference * (1 - p / 100);
  });
</script>