<template>
  <div class="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden flex flex-col h-full">
    <div class="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
      <div>
        <h2 class="text-2xl font-bold text-text-main-light dark:text-white mb-1">{{ data.month }} 工资单</h2>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-xs font-medium bg-emerald/10 text-emerald border border-emerald/20">已发放</span>
          <span class="text-xs text-text-secondary-light">发放日期: {{ data.paymentDate }}</span>
        </div>
      </div>
      <div class="text-right">
        <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">实发合计</p>
        <p class="text-3xl font-black text-emerald font-display">¥{{ data.netTotal.toLocaleString() }}</p>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-6 space-y-8">
      <section>
        <h3 class="text-sm font-bold text-text-main-light dark:text-white mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-lg">waterfall_chart</span>
          资金流向分析
        </h3>
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-border-light dark:border-border-dark">
          <SalaryWaterfallChart
            :gross="data.grossTotal"
            :deductions="data.deductions"
            :net="data.netTotal"
          />
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h3 class="text-sm font-bold text-text-main-light dark:text-white mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-lg">add_circle</span>
            应发项目
          </h3>
          <div class="space-y-3">
            <div v-for="(amount, name) in data.incomes" :key="name" class="flex justify-between items-center text-sm py-2 border-b border-dashed border-gray-200 dark:border-gray-700">
              <span class="text-text-secondary-light dark:text-text-secondary-dark">{{ name }}</span>
              <span class="font-semibold text-text-main-light dark:text-white">¥{{ amount.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center pt-2">
              <span class="font-bold text-text-main-light dark:text-white">应发合计</span>
              <span class="font-bold text-primary">¥{{ data.grossTotal.toLocaleString() }}</span>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-sm font-bold text-text-main-light dark:text-white mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-muted-red text-lg">do_not_disturb_on</span>
            扣除项目
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center text-sm py-2 border-b border-dashed border-gray-200 dark:border-gray-700">
              <span class="text-text-secondary-light">养老保险 (8%)</span>
              <span class="font-medium text-text-main-light dark:text-white">-¥{{ data.deductions.pension.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center text-sm py-2 border-b border-dashed border-gray-200 dark:border-gray-700">
              <span class="text-text-secondary-light">医疗保险 (2%)</span>
              <span class="font-medium text-text-main-light dark:text-white">-¥{{ data.deductions.medical.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center text-sm py-2 border-b border-dashed border-gray-200 dark:border-gray-700">
              <span class="text-text-secondary-light">失业保险 (0.5%)</span>
              <span class="font-medium text-text-main-light dark:text-white">-¥{{ data.deductions.unemployment.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center text-sm py-2 border-b border-dashed border-gray-200 dark:border-gray-700">
              <span class="text-text-secondary-light">住房公积金 (12%)</span>
              <span class="font-medium text-text-main-light dark:text-white">-¥{{ data.deductions.fund.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center text-sm py-2 border-b border-dashed border-gray-200 dark:border-gray-700">
              <span class="text-text-secondary-light">个人所得税</span>
              <span class="font-medium text-text-main-light dark:text-white">-¥{{ data.deductions.tax.toLocaleString() }}</span>
            </div>

            <div class="flex justify-between items-center pt-2">
              <span class="font-bold text-text-main-light dark:text-white">扣除合计</span>
              <span class="font-bold text-muted-red">-¥{{ totalDeduction.toLocaleString() }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="p-4 border-t border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
      <span class="text-xs text-text-secondary-light">单据编号: S-202405-001</span>
      <div class="flex gap-3">
        <button class="flex items-center gap-1 text-sm font-medium text-text-secondary-light hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-lg">share</span> 分享
        </button>
        <button class="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors">
          <span class="material-symbols-outlined text-lg">download</span> 下载PDF
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import SalaryWaterfallChart from './SalaryWaterfallChart.vue';

  const props = defineProps<{
    data: any // 暂时使用any，后续对接Shared Types
  }>();

  const totalDeduction = computed(() => {
    const d = props.data.deductions;
    return d.pension + d.medical + d.unemployment + d.fund + d.tax;
  });
</script>