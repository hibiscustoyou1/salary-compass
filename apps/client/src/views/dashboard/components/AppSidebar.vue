<template>
  <div
    v-if="isOpen"
    @click="$emit('close')"
    class="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
  ></div>

  <aside
    class="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64 flex-shrink-0 z-40 flex flex-col h-full
           fixed inset-y-0 left-0 shadow-xl md:shadow-none
           transform transition-transform duration-300 ease-in-out
           md:static md:transform-none transition-colors"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
  >
    <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
          <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <span class="text-lg font-bold text-gray-800 dark:text-white tracking-tight">财富仪表盘</span>
      </div>
      <button @click="$emit('close')" class="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>

    <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
      <button
        v-for="item in menuItems"
        :key="item.id"
        @click="handleSelect(item.id)"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group"
        :class="modelValue === item.id
          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
      >
        <component :is="item.icon" class="w-5 h-5 transition-colors" :class="modelValue === item.id ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'" />
        {{ item.label }}
      </button>
    </nav>

    <div class="p-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-600 text-center">
      Powered by vue-data-ui
    </div>
  </aside>
</template>

<script setup lang="ts">
  import type { Component } from 'vue';

  defineProps<{
    modelValue: string;
    menuItems: { id: string; label: string; icon: Component }[];
    isOpen: boolean;
  }>();

  const emit = defineEmits(['update:modelValue', 'close']);

  const handleSelect = (id: string) => {
    emit('update:modelValue', id);
    emit('close');
  };
</script>
