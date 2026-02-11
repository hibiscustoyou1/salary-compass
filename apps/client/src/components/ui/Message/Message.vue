<template>
  <transition name="message-fade" @after-leave="destroy">
    <div
      v-show="visible"
      class="fixed left-1/2 top-8 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium border backdrop-blur-md transition-all duration-300"
      :class="typeClasses[type]"
    >
      <span class="material-symbols-outlined text-[18px]">{{ iconMap[type] }}</span>
      <span>{{ content }}</span>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  const props = defineProps<{
    type: 'success' | 'error' | 'warning' | 'info';
    content: string;
    duration?: number;
    onDestroy: () => void;
  }>();

  const visible = ref(false);

  const typeClasses: Record<string, string> = {
    success: 'bg-emerald-50/90 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    error: 'bg-red-50/90 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    warning: 'bg-amber-50/90 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    info: 'bg-blue-50/90 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
  };

  const iconMap: Record<string, string> = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };

  onMounted(() => {
    visible.value = true;
    setTimeout(() => {
      visible.value = false;
    }, props.duration || 3000);
  });

  const destroy = () => {
    props.onDestroy();
  };
</script>

<style scoped>
.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>