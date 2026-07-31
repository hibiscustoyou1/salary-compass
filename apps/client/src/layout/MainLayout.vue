<template>
  <div
    class="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden font-sans text-text-main-light dark:text-text-main-dark transition-colors duration-200">
    <!-- 移动端侧边栏遮罩 -->
    <transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="uiStore.isMobileMenuOpen" @click="uiStore.closeMobileMenu"
        class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden">
      </div>
    </transition>

    <!-- 侧边栏 -->
    <Sidebar :privacy-mode="uiStore.isPrivacyMode" />

    <main class="flex-1 flex flex-col h-full overflow-hidden relative">
      <header
        class="sticky top-0 z-30 bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-md px-4 lg:px-8 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center shrink-0 gap-4">
        <div class="flex items-center gap-3 flex-1 overflow-hidden">
          <!-- 移动端汉堡菜单按钮 -->
          <button @click="uiStore.toggleMobileMenu"
            class="lg:hidden p-2 -ml-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span class="material-symbols-outlined text-2xl select-none leading-none block">menu</span>
          </button>

          <div class="flex flex-col flex-1 truncate">
            <h1 class="text-xl lg:text-2xl font-bold tracking-tight truncate">{{ currentTitle.title }}</h1>
            <p class="text-xs lg:text-sm text-text-secondary-light dark:text-text-secondary-dark truncate">{{
              currentTitle.subtitle }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 lg:gap-3">
          <!-- 全局年份选择器 -->
          <div v-if="showYearSelector" class="relative z-50" ref="yearDropdownRef">
            <button @click="isYearOpen = !isYearOpen"
              class="flex items-center gap-2 h-10 px-3 lg:px-4 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm focus:border-primary/50 outline-none text-sm font-bold">
              <span class="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>{{ dashboardStore.dashboardYear }}年</span>
              <span class="material-symbols-outlined text-[18px] transition-transform duration-300"
                :class="{ 'rotate-180': isYearOpen }">expand_more</span>
            </button>
            <transition enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0">
              <div v-if="isYearOpen"
                class="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-border-light dark:border-border-dark py-2 overflow-hidden origin-top-right backdrop-blur-xl">
                <div class="max-h-60 overflow-y-auto custom-scrollbar">
                  <button v-for="year in dashboardStore.availableYears" :key="year" @click="handleSelectYear(year)"
                    class="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group"
                    :class="dashboardStore.dashboardYear === year ? 'text-primary font-bold bg-primary/5 dark:bg-primary/10' : 'text-text-secondary-light dark:text-text-secondary-dark'">
                    <span>{{ year }}年</span>
                    <span v-if="dashboardStore.dashboardYear === year"
                      class="material-symbols-outlined text-base">check</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>

          <button @click="uiStore.toggleTheme"
            class="p-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="切换主题">
            <span class="material-symbols-outlined text-lg overflow-hidden w-5 h-5 select-none text-center">{{
              uiStore.isDarkMode ? 'light_mode' : 'dark_mode' }}</span>
          </button>

          <button @click="uiStore.togglePrivacy"
            :class="uiStore.isPrivacyMode ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white dark:bg-card-dark border-border-light dark:border-border-dark text-text-secondary-light'"
            class="flex items-center gap-2 h-10 px-3 lg:px-4 rounded-lg border text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <span
              class="material-symbols-outlined text-lg overflow-hidden w-5 h-5 select-none leading-none inline-flex items-center justify-center">{{
                uiStore.isPrivacyMode ? 'visibility' : 'visibility_off' }}</span> <span class="hidden sm:inline">{{
                uiStore.isPrivacyMode ? '显示数据' : '隐私模式' }}</span>
          </button>

          <button
            class="flex items-center gap-2 h-10 px-3 lg:px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors shadow-md shadow-primary/20">
            <span
              class="material-symbols-outlined text-lg overflow-hidden w-5 h-5 select-none leading-none inline-flex items-center justify-center">download</span>
            <span class="hidden sm:inline">导出报告</span>
          </button>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/layout/SideBar.vue';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
// 引入全局状态
import { useUIStore } from '@/stores/ui.store';
import { useDashboardStore } from '@/stores/dashboard.store';

const route = useRoute();
const uiStore = useUIStore();
const dashboardStore = useDashboardStore();

// 年份选择器相关状态
const isYearOpen = ref(false);
const yearDropdownRef = ref<HTMLElement | null>(null);

const handleSelectYear = (year: number) => {
  dashboardStore.switchYear(year);
  isYearOpen.value = false;
};

const handleClickOutside = (e: MouseEvent) => {
  if (yearDropdownRef.value && !yearDropdownRef.value.contains(e.target as Node)) {
    isYearOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  // 可选：确保在 layout 首次加载时若 store 数据为空则自启动
  if (dashboardStore.availableYears.length === 0) {
    dashboardStore.initDashboard();
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 根据路由 Meta 获取标题
const currentTitle = computed(() => {
  return {
    title: (route.meta.title as string) || 'WealthTrack',
    subtitle: (route.meta.subtitle as string) || 'Loading...'
  };
});

// 控制年份选择器显示范围
const showYearSelector = computed(() => {
  return ['dashboard', 'tax'].includes(route.name as string);
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

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
</style>