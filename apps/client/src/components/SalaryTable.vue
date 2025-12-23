<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300 flex flex-col">

    <div class="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
      <div class="flex items-center gap-2">
        <div class="w-1 h-4 bg-emerald-500 rounded-full"></div>
        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">
          薪资明细表
        </h3>
        <span class="text-xs text-gray-400 dark:text-gray-500 ml-2 font-normal">
          {{ selectedYear !== 0 ? `${selectedYear}年全明细` : `共 ${data.length} 条记录` }}
        </span>
      </div>
      <div v-if="isPrivacyMode" class="text-xs text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded">
        隐私保护中
      </div>
    </div>

    <div class="overflow-x-auto flex-1">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700/50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
            月份
          </th>
          <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
            基本工资
          </th>
          <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
            绩效/奖金
          </th>
          <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider whitespace-nowrap">
            税前总包
          </th>
          <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
            五险一金
          </th>
          <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
            个税
          </th>
          <th scope="col" class="px-6 py-3 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider whitespace-nowrap">
            实发到手
          </th>
        </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        <tr
          v-for="item in displayData"
          :key="`${item.year}-${item.month}`"
          class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 font-medium">
            {{ item.year }}-{{ String(item.month).padStart(2, '0') }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
            {{ formatMoney(item.baseSalary || 0) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
            {{ formatMoney((item.meritPay || 0) + (item.quarterlyBonus || 0) + (item.annualBonus || 0)) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 font-medium text-right">
            {{ formatMoney(item.grossPay || 0) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
            {{ formatMoney((item.housingFund || 0) + (item.pension || 0) + (item.medical || 0) + (item.unemployment || 0)) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
            {{ formatMoney(item.tax || 0) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 dark:text-emerald-400 font-bold text-right">
            {{ formatMoney(item.netPay || 0) }}
          </td>
        </tr>
        <tr v-if="displayData.length === 0">
          <td colspan="7" class="px-6 py-10 text-center text-gray-400 text-sm">
            暂无数据
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="shouldPaginate && totalPages > 1"
      class="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between flex-shrink-0"
    >
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700 dark:text-gray-400">
            显示第
            <span class="font-medium">{{ startIndex + 1 }}</span>
            到
            <span class="font-medium">{{ Math.min(endIndex, data.length) }}</span>
            条，共
            <span class="font-medium">{{ data.length }}</span>
            条
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span class="sr-only">Previous</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span class="sr-only">Next</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>

      <div class="flex sm:hidden justify-between w-full gap-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          上一页
        </button>
        <span class="flex items-center text-sm text-gray-500 dark:text-gray-400">
           {{ currentPage }} / {{ totalPages }}
        </span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import type { WageData } from '@/api/wageService';

  const props = defineProps<{
    data: WageData[];
    isPrivacyMode: boolean;
    selectedYear: number; // 【新增】接收年份，用于判断逻辑
    pageSize?: number;
  }>();

  // --- 状态 ---
  const currentPage = ref(1);
  const size = props.pageSize || 10;

  // --- 核心逻辑判断 ---
  // 只有当选中"全部年份"(0)时，才启用分页
  const shouldPaginate = computed(() => props.selectedYear === 0);

  // --- 数据计算 ---
  const totalPages = computed(() => Math.ceil(props.data.length / size));

  // 决定最终显示的数据
  const displayData = computed(() => {
    // 1. 如果是具体年份 -> 直接展示全部数据 (通常只有12条)
    if (!shouldPaginate.value) {
      return props.data;
    }

    // 2. 如果是全部年份 -> 执行分页切割
    const start = (currentPage.value - 1) * size;
    const end = start + size;
    return props.data.slice(start, end);
  });

  const startIndex = computed(() => (currentPage.value - 1) * size);
  const endIndex = computed(() => currentPage.value * size);

  // --- 翻页动作 ---
  const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
  const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };

  // 监听数据源变化，自动回到第一页
  watch(() => props.data, () => { currentPage.value = 1; });

  // --- 工具函数 ---
  const formatMoney = (val: number) => {
    if (props.isPrivacyMode) return '******';
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
</script>
