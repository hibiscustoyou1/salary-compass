<template>
  <component :is="layout">
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </transition>
    </router-view>
  </component>
</template>

<script setup lang="ts">
  import { computed, defineAsyncComponent } from 'vue';
  import { useRoute } from 'vue-router';
  import { useUIStore } from '@/stores/ui.store';

  // 动态导入布局组件
  const MainLayout = defineAsyncComponent(() => import('@/layout/MainLayout.vue'));

  const route = useRoute();
  const uiStore = useUIStore();
  
  // 初始化 UI Store，触发主题持久化逻辑
  useUIStore();

  const layout = computed(() => {
    return route.meta.layout === 'MainLayout' ? MainLayout : 'div';
  });
</script>

<style>
/* 确保背景色随主题平滑过渡 */
body {
  transition: background-color 0.3s ease, color 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>