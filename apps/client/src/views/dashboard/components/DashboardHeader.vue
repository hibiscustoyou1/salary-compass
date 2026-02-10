<template>
  <div class="flex justify-between items-center bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-sm border border-border-light dark:border-border-dark">
    <div>
      <h2 class="text-lg font-bold text-text-main-light dark:text-white">年度概览</h2>
      <p class="text-xs text-text-secondary-light dark:text-text-secondary-dark">查看 {{ store.dashboardYear }} 年度核心财务指标</p>
    </div>

    <div class="relative z-20" ref="yearDropdownRef">
      <button @click="isOpen = !isOpen"
              class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-text-main-light dark:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border border-transparent focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none">
        <span>{{ store.dashboardYear }}年</span>
        <span class="material-symbols-outlined text-lg transition-transform duration-300" :class="{ 'rotate-180': isOpen }">expand_more</span>
      </button>

      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div v-if="isOpen" class="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-border-light dark:border-border-dark py-2 overflow-hidden origin-top-right">
          <div class="max-h-60 overflow-y-auto custom-scrollbar">
            <button v-for="year in store.availableYears" :key="year"
                    @click="handleSelect(year)"
                    class="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group"
                    :class="store.dashboardYear === year ? 'text-primary font-bold bg-primary/5 dark:bg-primary/10' : 'text-text-secondary-light dark:text-text-secondary-dark'">
              <span>{{ year }}年</span>
              <span v-if="store.dashboardYear === year" class="material-symbols-outlined text-base">check</span>
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useDashboardStore } from '@/stores/dashboard.store';

  const store = useDashboardStore();
  const isOpen = ref(false);
  const yearDropdownRef = ref<HTMLElement | null>(null);

  const handleSelect = (year: number) => {
    store.switchYear(year);
    isOpen.value = false;
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (yearDropdownRef.value && !yearDropdownRef.value.contains(e.target as Node)) {
      isOpen.value = false;
    }
  };

  onMounted(() => document.addEventListener('click', handleClickOutside));
  onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 3px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #475569; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
</style>