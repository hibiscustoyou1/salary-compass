<template>
  <header class="sticky top-0 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-6 py-4 border-b border-border-light dark:border-border-dark flex flex-wrap justify-between items-center gap-4">
    <div class="flex flex-col">
      <h1 class="text-2xl font-bold tracking-tight text-text-main-light dark:text-white">{{ title }}</h1>
      <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-3">
      <button class="flex items-center gap-2 h-10 px-4 rounded-lg bg-white dark:bg-card-dark border border-border-light dark:border-border-dark text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
        <span class="material-symbols-outlined text-lg">visibility_off</span>
        <span class="hidden sm:inline">隐私模式</span>
      </button>
      <button class="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors shadow-md shadow-primary/20">
        <span class="material-symbols-outlined text-lg">download</span>
        <span>导出报告</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '职业财富分析'
  },
  subtitle: {
    type: String,
    default: '2024财年绩效表现'
  }
});
</script>