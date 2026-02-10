<template>
  <div class="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden font-sans text-text-main-light dark:text-text-main-dark transition-colors duration-200">
    <Sidebar :model-value="currentTab" :privacy-mode="privacyMode" class="hidden lg:flex" />

    <main class="flex-1 flex flex-col h-full overflow-hidden relative">
      <header class="sticky top-0 z-10 bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-md px-4 lg:px-8 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center shrink-0 gap-4">
        <div class="flex flex-col flex-1">
          <h1 class="text-xl lg:text-2xl font-bold tracking-tight truncate">{{ currentTitle.title }}</h1>
          <p class="text-xs lg:text-sm text-text-secondary-light dark:text-text-secondary-dark truncate">{{ currentTitle.subtitle }}</p>
        </div>

        <div class="flex items-center gap-2 lg:gap-3">
          <button @click="toggleDarkMode" class="p-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="切换主题">
            <span class="material-symbols-outlined text-lg overflow-hidden w-5 h-5 select-none text-center">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
          </button>

          <button @click="togglePrivacy"
                  :class="privacyMode ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white dark:bg-card-dark border-border-light dark:border-border-dark text-text-secondary-light'"
                  class="flex items-center gap-2 h-10 px-3 lg:px-4 rounded-lg border text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <span class="material-symbols-outlined text-lg overflow-hidden w-5 h-5 select-none text-center">{{ privacyMode ? 'visibility' : 'visibility_off' }}</span>
            <span class="hidden sm:inline">{{ privacyMode ? '显示数据' : '隐私模式' }}</span>
          </button>

          <button class="flex items-center gap-2 h-10 px-3 lg:px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors shadow-md shadow-primary/20">
            <span class="material-symbols-outlined text-lg overflow-hidden w-5 h-5 select-none text-center">download</span>
            <span class="hidden sm:inline">导出报告</span>
          </button>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :privacy-mode="privacyMode" :is-active="true" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import Sidebar from '@/components/layout/SideBar.vue';
  import { ref, computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();
  const privacyMode = ref(true);
  const isDark = ref(false);

  // 根据路由名称确定当前 Tab
  const currentTab = computed(() => (route.name as string) || 'dashboard');

  // 根据路由 Meta 获取标题
  const currentTitle = computed(() => {
    return {
      title: (route.meta.title as string) || 'WealthTrack',
      subtitle: (route.meta.subtitle as string) || 'Loading...'
    };
  });

  const togglePrivacy = () => {
    privacyMode.value = !privacyMode.value;
  };

  const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    if (isDark.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  onMounted(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      isDark.value = true;
      document.documentElement.classList.add('dark');
    }
  });
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>