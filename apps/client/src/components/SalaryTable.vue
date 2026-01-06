<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 flex flex-col hover:shadow-md h-full">

    <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center flex-shrink-0 bg-white dark:bg-gray-800 relative z-10">
      <div class="flex items-center gap-3">
        <div class="w-1.5 h-5 bg-emerald-500 rounded-full shadow-sm shadow-emerald-200 dark:shadow-none"></div>
        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">
          薪资明细表
        </h3>
        <span class="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 font-medium">
          {{ selectedYear !== 0 ? `${selectedYear}年` : `共 ${data.length} 条` }}
        </span>
      </div>
      <div v-if="isPrivacyMode" class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30">
        <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
        <span class="text-xs font-medium text-orange-600 dark:text-orange-400">隐私保护模式</span>
      </div>
    </div>

    <div class="overflow-x-auto flex-1 min-h-[400px]">
      <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
        <thead class="bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm sticky top-0 z-0">
        <tr>
          <th
            scope="col"
            class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors group select-none"
            @click="toggleSort"
          >
            <div class="flex items-center gap-2">
              月份
              <div class="flex flex-col gap-[2px]">
                <div class="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[4px]"
                     :class="sortOrder === 'asc' ? 'border-b-emerald-500' : 'border-b-gray-300 dark:border-b-gray-600'"></div>
                <div class="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px]"
                     :class="sortOrder === 'desc' ? 'border-t-emerald-500' : 'border-t-gray-300 dark:border-t-gray-600'"></div>
              </div>
            </div>
          </th>
          <th v-for="header in ['基本工资', '绩效/奖金', '税前总包', '五险一金', '个税', '实发到手']"
              :key="header"
              scope="col"
              class="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
              :class="{
                'text-blue-600 dark:text-blue-400': header === '税前总包',
                'text-emerald-600 dark:text-emerald-400': header === '实发到手'
              }"
          >
            {{ header }}
          </th>
        </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/50">
        <tr
          v-for="item in displayData"
          :key="`${item.year}-${item.month}`"
          class="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors duration-150 group"
        >
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 font-medium font-mono group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {{ item.year }}-{{ String(item.month).padStart(2, '0') }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right font-mono">
            {{ formatMoney(item.baseSalary || 0) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right font-mono">
            {{ formatMoney((item.meritPay || 0) + (item.quarterlyBonus || 0) + (item.annualBonus || 0)) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 font-medium text-right font-mono bg-blue-50/30 dark:bg-blue-900/10">
            {{ formatMoney(item.grossPay || 0) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right font-mono">
            {{ formatMoney((item.housingFund || 0) + (item.pension || 0) + (item.medical || 0) + (item.unemployment || 0)) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right font-mono">
            {{ formatMoney(item.tax || 0) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 dark:text-emerald-400 font-bold text-right font-mono bg-emerald-50/30 dark:bg-emerald-900/10">
            {{ formatMoney(item.netPay || 0) }}
          </td>
        </tr>
        <tr v-if="displayData.length === 0">
          <td colspan="7" class="px-6 py-12">
            <div class="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <svg class="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              <span class="text-sm">暂无数据记录</span>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="shouldPaginate"
      class="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300"
    >
      <div class="text-sm text-gray-500 dark:text-gray-400 font-medium">
        显示第 <span class="text-gray-900 dark:text-gray-200 font-bold">{{ startIndex + 1 }}</span> - <span class="text-gray-900 dark:text-gray-200 font-bold">{{ Math.min(endIndex, data.length) }}</span> 条，
        共 <span class="text-gray-900 dark:text-gray-200 font-bold">{{ data.length }}</span> 条
      </div>

      <div class="flex items-center gap-4">

        <div class="flex items-center gap-2 group relative" ref="dropdownRef">
          <span class="text-xs text-gray-400 dark:text-gray-500 font-medium">每页</span>

          <button
            @click.stop="toggleDropdown"
            class="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium outline-none transition-all shadow-sm hover:shadow hover:border-emerald-500/50 min-w-[5.5rem] justify-between"
            :class="isDropdownOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'"
          >
            <span>{{ pageSize }} 条</span>
            <svg
              class="w-3.5 h-3.5 text-gray-400 transition-transform duration-200"
              :class="{ 'rotate-180': isDropdownOpen }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0 translate-y-2"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 translate-y-2"
          >
            <div
              v-if="isDropdownOpen"
              class="absolute bottom-full mb-2 right-0 w-28 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-600 py-1 z-50 overflow-hidden ring-1 ring-black ring-opacity-5"
            >
              <div
                v-for="size in [10, 20, 50]"
                :key="size"
                @click="selectPageSize(size)"
                class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer flex items-center justify-between transition-colors"
                :class="{ 'bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 font-medium': pageSize === size }"
              >
                <span>{{ size }} 条</span>
                <svg v-if="pageSize === size" class="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </transition>
        </div>

        <div class="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-2 hidden sm:block"></div>

        <div class="flex items-center gap-2">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-600 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/50 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 disabled:hover:border-gray-200 disabled:shadow-none transition-all duration-200 active:scale-95"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </button>

          <div class="px-1 min-w-[3.5rem] text-center select-none">
            <span class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ currentPage }}</span>
            <span class="text-xs text-gray-400 dark:text-gray-500 mx-1">/</span>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ totalPages }}</span>
          </div>

          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-600 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/50 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 disabled:hover:border-gray-200 disabled:shadow-none transition-all duration-200 active:scale-95"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
  import type { WageData } from '@/api/wageService';

  const props = defineProps<{
    data: WageData[];
    isPrivacyMode: boolean;
    selectedYear: number;
    initialPageSize?: number;
  }>();

  // --- 状态 ---
  const currentPage = ref(1);
  const pageSize = ref(props.initialPageSize || 10);
  const isDropdownOpen = ref(false); // 控制自定义下拉菜单
  const dropdownRef = ref<HTMLElement | null>(null); // 用于点击外部关闭

  type SortOrder = 'asc' | 'desc';
  const sortOrder = ref<SortOrder>('desc');

  // --- 核心逻辑 ---
  const shouldPaginate = computed(() => props.selectedYear === 0);

  // --- 自定义下拉菜单逻辑 ---
  const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value;
  };

  const selectPageSize = (size: number) => {
    pageSize.value = size;
    isDropdownOpen.value = false;
  };

  // 点击外部关闭下拉菜单
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
      isDropdownOpen.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });

  // --- 排序 ---
  const toggleSort = () => {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
  };

  const sortedData = computed(() => {
    return [...props.data].sort((a, b) => {
      if (a.year !== b.year) {
        return sortOrder.value === 'desc'
          ? b.year - a.year
          : a.year - b.year;
      }
      return sortOrder.value === 'desc'
        ? b.month - a.month
        : a.month - b.month;
    });
  });

  // --- 分页 ---
  const totalPages = computed(() => Math.ceil(props.data.length / pageSize.value));

  const displayData = computed(() => {
    const source = sortedData.value;
    if (!shouldPaginate.value) {
      return source;
    }
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return source.slice(start, end);
  });

  const startIndex = computed(() => (currentPage.value - 1) * pageSize.value);
  const endIndex = computed(() => currentPage.value * pageSize.value);

  // --- 动作 ---
  const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
  const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };

  watch(() => props.data, () => { currentPage.value = 1; });
  watch(pageSize, () => { currentPage.value = 1; });

  // --- 工具 ---
  const formatMoney = (val: number) => {
    if (props.isPrivacyMode) return '******';
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
</script>
