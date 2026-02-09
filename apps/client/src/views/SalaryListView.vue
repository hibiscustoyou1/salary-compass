<template>
  <div class="flex flex-col xl:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px]">
    <div class="flex-1 w-full xl:flex-[2] bg-card-light dark:bg-card-dark rounded-xl shadow-soft border border-border-light dark:border-border-dark flex flex-col overflow-hidden transition-colors duration-200">

      <div class="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center shrink-0">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">history</span>
          <h2 class="font-bold text-lg text-text-main-light dark:text-white">薪资历史记录</h2>
        </div>

        <div class="relative z-20" ref="yearDropdownRef">
          <button @click="isYearDropdownOpen = !isYearDropdownOpen"
                  class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-text-main-light dark:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border border-transparent focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none">
            <span>{{ selectedYear }}年</span>
            <span class="material-symbols-outlined text-lg transition-transform duration-300" :class="{ 'rotate-180': isYearDropdownOpen }">expand_more</span>
          </button>
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div v-if="isYearDropdownOpen" class="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-border-light dark:border-border-dark py-2 overflow-hidden origin-top-right">
              <div class="max-h-60 overflow-y-auto">
                <button v-for="year in availableYears" :key="year"
                        @click="selectYear(year)"
                        class="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group"
                        :class="selectedYear === year ? 'text-primary font-bold bg-primary/5 dark:bg-primary/10' : 'text-text-secondary-light dark:text-text-secondary-dark'">
                  <span>{{ year }}年</span>
                  <span v-if="selectedYear === year" class="material-symbols-outlined text-base">check</span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div class="overflow-y-auto flex-1 custom-scrollbar">
        <table class="w-full text-left border-collapse">
          <thead class="sticky top-0 bg-card-light dark:bg-card-dark z-10 shadow-sm">
          <tr class="text-text-secondary-light dark:text-text-secondary-dark text-xs uppercase tracking-wider border-b border-border-light dark:border-border-dark">
            <th class="px-6 py-4 font-semibold">期间</th>
            <th class="px-6 py-4 font-semibold text-right">应发合计</th>
            <th class="px-6 py-4 font-semibold text-right hidden md:table-cell">扣款合计</th>
            <th class="px-6 py-4 font-semibold text-right">实发合计</th>
          </tr>
          </thead>
          <tbody class="text-sm">
          <tr v-for="(record, index) in filteredSalaryHistory" :key="record.period"
              @click="selectedSalary = record"
              :class="[
                  selectedSalary === record ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 border-l-transparent',
                  'cursor-pointer transition-colors border-b border-border-light dark:border-border-dark'
                ]">
            <td class="px-6 py-4 font-medium" :class="selectedSalary === record ? 'text-primary dark:text-blue-400' : 'text-text-main-light dark:text-white'">{{ record.period }}</td>
            <td class="px-6 py-4 text-right text-text-secondary-light dark:text-text-secondary-dark">{{ masked(record.gross) }}</td>
            <td class="px-6 py-4 text-right text-red-custom hidden md:table-cell">{{ privacyMode ? '****' : '-' + record.deduction }}</td>
            <td class="px-6 py-4 text-right font-bold text-emerald-custom text-base">{{ masked(record.net) }}</td>
          </tr>
          </tbody>
        </table>

        <div v-if="filteredSalaryHistory.length === 0" class="flex flex-col items-center justify-center h-40 text-text-secondary-light dark:text-text-secondary-dark">
          <span class="material-symbols-outlined text-4xl mb-2 opacity-50">folder_off</span>
          <span class="text-sm">无数据或正在加载...</span>
        </div>
      </div>
    </div>

    <div class="flex-1 w-full xl:flex-[1.2] bg-card-light dark:bg-card-dark rounded-xl shadow-soft border border-border-light dark:border-border-dark flex flex-col relative overflow-hidden transition-colors duration-200">
      <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-400"></div>

      <div v-if="selectedSalary" class="p-6 md:p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
        <div class="flex justify-between items-start mb-6 shrink-0">
          <div>
            <p class="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">{{ selectedSalary.period }}</p>
            <h3 class="text-xl font-bold text-text-main-light dark:text-white mt-1">电子工资单</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-primary dark:text-blue-400 shadow-sm">
            <span class="material-symbols-outlined">receipt_long</span>
          </div>
        </div>

        <div class="mb-8 text-center bg-emerald-custom/5 dark:bg-emerald-custom/10 py-6 rounded-2xl border border-emerald-custom/20 shrink-0">
          <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">实发合计 (Net Pay)</p>
          <div class="text-4xl font-extrabold text-emerald-custom tracking-tight">{{ masked(selectedSalary.net) }}</div>
        </div>

        <div class="mb-8 shrink-0">
          <h3 class="text-sm font-bold text-text-main-light dark:text-white mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-lg">waterfall_chart</span>
            资金流向分析
          </h3>
          <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-border-light dark:border-border-dark">
            <SalaryWaterfall
              :gross="selectedSalary.gross"
              :deductions="selectedSalary.details.deductions"
              :net="selectedSalary.net"
              :privacy-mode="privacyMode"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-1 h-4 bg-primary rounded-full"></span>
              <h4 class="font-bold text-text-main-light dark:text-white">收入项目</h4>
            </div>
            <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3 flex-1 flex flex-col border border-border-light dark:border-border-dark">
              <div v-if="Object.keys(selectedSalary.details.income).length === 0" class="flex-1 flex items-center justify-center text-xs text-text-secondary-light p-4">
                暂无明细
              </div>
              <div v-else v-for="(amount, label) in selectedSalary.details.income" :key="label" class="flex justify-between items-center text-sm">
                <span class="text-text-secondary-light dark:text-text-secondary-dark">{{ label }}</span>
                <span class="font-semibold text-text-main-light dark:text-white">{{ masked(amount) }}</span>
              </div>
              <div class="border-t border-border-light dark:border-border-dark my-2 pt-2 flex justify-between items-center mt-auto">
                <span class="font-medium text-text-main-light dark:text-white">应发合计</span>
                <span class="font-bold text-primary dark:text-blue-400">{{ masked(selectedSalary.gross) }}</span>
              </div>
            </div>
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-1 h-4 bg-red-custom rounded-full"></span>
              <h4 class="font-bold text-text-main-light dark:text-white">扣除项目</h4>
            </div>
            <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3 flex-1 flex flex-col border border-border-light dark:border-border-dark">
              <div v-if="Object.keys(selectedSalary.details.deductions).length === 0" class="flex-1 flex items-center justify-center text-xs text-text-secondary-light p-4">
                暂无明细
              </div>
              <div v-else v-for="(amount, label) in selectedSalary.details.deductions" :key="label" class="flex justify-between items-center text-sm">
                <span class="text-text-secondary-light dark:text-text-secondary-dark">{{ label }}</span>
                <span class="font-semibold text-text-main-light dark:text-white">{{ privacyMode ? '****' : '-' + amount }}</span>
              </div>
              <div class="border-t border-border-light dark:border-border-dark my-2 pt-2 flex justify-between items-center mt-auto">
                <span class="font-medium text-text-main-light dark:text-white">扣款合计</span>
                <span class="font-bold text-red-custom">{{ masked(selectedSalary.deduction) }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div v-else class="flex flex-col items-center justify-center h-full text-text-secondary-light">
        <span class="material-symbols-outlined text-5xl mb-4 opacity-30">receipt_long</span>
        <p>请选择一条薪资记录查看详情</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useWageStore } from '@/stores/wage.store';
  import { SalaryRecord } from '@/api'; // Update Import
  import SalaryWaterfall from '@/components/charts/SalaryWaterfall.vue';

  const props = defineProps<{
    isActive: boolean;
    privacyMode: boolean;
  }>();

  const store = useWageStore();
  const selectedYear = ref('2024');
  const isYearDropdownOpen = ref(false);
  const yearDropdownRef = ref<HTMLElement | null>(null);
  const selectedSalary = ref<SalaryRecord | null>(null);

  // init data if not
  onMounted(() => {
    store.initData();
    document.addEventListener('click', handleClickOutside);
  });

  // Watch store data to set default selection
  watch(() => store.salaryHistory, (newVal) => {
    if (newVal.length > 0 && !selectedSalary.value) {
      const currentYearStr = new Date().getFullYear().toString();
      selectedYear.value = currentYearStr;
      const firstRecord = newVal.find(r => r.period.startsWith(currentYearStr));
      selectedSalary.value = firstRecord || newVal[0];
    }
  }, { immediate: true });

  // Available years
  const availableYears = computed(() => {
    const years = new Set(store.salaryHistory.map(item => item.year));
    return Array.from(years).sort((a, b) => b - a);
  });

  const filteredSalaryHistory = computed(() => {
    return store.salaryHistory.filter(item => item.year === Number(selectedYear.value));
  });

  const selectYear = (year: number) => {
    selectedYear.value = year.toString();
    isYearDropdownOpen.value = false;
    const firstInYear = store.salaryHistory.find(item => item.year === year);
    if (firstInYear) selectedSalary.value = firstInYear;
  };

  const masked = (val: string) => props.privacyMode ? '****' : val;

  const handleClickOutside = (e: MouseEvent) => {
    if (yearDropdownRef.value && !yearDropdownRef.value.contains(e.target as Node)) {
      isYearDropdownOpen.value = false;
    }
  };

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>