<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 h-16 flex items-center justify-between flex-shrink-0 z-20 gap-2 transition-colors duration-300">

    <div class="flex items-center gap-3">
      <button
        @click="$emit('toggleMenu')"
        class="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <h2 class="text-lg font-semibold text-gray-800 dark:text-white tracking-tight truncate max-w-[120px] md:max-w-none transition-colors">
        {{ title }}
      </h2>
    </div>

    <div class="flex items-center gap-2 md:gap-3">

      <button
        @click="toggleTheme"
        class="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-3 md:py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all active:scale-95"
        :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
      >
        <svg v-if="isDark" class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
      </button>

      <div class="relative" ref="dropdownRef">
        <button
          @click="toggleDropdown"
          class="flex items-center justify-between w-28 md:w-36 px-2 md:px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:shadow text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 focus:outline-none"
        >
          <span class="flex items-center gap-1 md:gap-2 truncate">
            <span>{{ selectedYear === 0 ? '全部' : `${selectedYear}年` }}</span>
          </span>
          <svg
            class="w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0"
            :class="{ 'rotate-180 text-emerald-500': isDropdownOpen }"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-if="isDropdownOpen"
            class="absolute right-0 mt-2 w-36 md:w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 overflow-hidden ring-1 ring-black ring-opacity-5"
          >
            <div @click="handleSelect(0)" class="px-4 py-2.5 text-sm cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex justify-between" :class="selectedYear === 0 ? 'text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-700 dark:text-gray-300'">
              <span>全部</span>
              <span v-if="selectedYear === 0">✓</span>
            </div>
            <div class="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
            <div v-for="year in availableYears" :key="year" @click="handleSelect(year)" class="px-4 py-2.5 text-sm cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex justify-between" :class="selectedYear === year ? 'text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-700 dark:text-gray-300'">
              <span>{{ year }}年</span>
              <span v-if="selectedYear === year">✓</span>
            </div>
          </div>
        </Transition>
      </div>

      <button
        @click="$emit('togglePrivacy')"
        class="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm active:scale-95 transition-all"
        title="切换隐私模式"
      >
        <svg v-if="isPrivacyMode" class="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
        <svg v-else class="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
        <span class="hidden md:inline text-sm font-medium ml-2">{{ isPrivacyMode ? '显示' : '隐藏' }}</span>
      </button>

    </div>
  </header>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useTheme } from '../composables/useTheme'; // 【引入】

  defineProps<{
    title?: string;
    selectedYear: number;
    availableYears: number[];
    isPrivacyMode: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:selectedYear', year: number): void;
    (e: 'togglePrivacy'): void;
    (e: 'toggleMenu'): void;
  }>();

  // 主题控制
  const { isDark, toggleTheme } = useTheme();

  // 下拉菜单逻辑
  const isDropdownOpen = ref(false);
  const dropdownRef = ref<HTMLElement | null>(null);
  const toggleDropdown = () => isDropdownOpen.value = !isDropdownOpen.value;
  const handleSelect = (year: number) => { isDropdownOpen.value = false; emit('update:selectedYear', year); };
  const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) isDropdownOpen.value = false; };
  onMounted(() => document.addEventListener('click', handleClickOutside));
  onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>
