<template>
  <div class="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
    <div class="w-full lg:w-80 flex flex-col bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden shrink-0">
      <div class="p-4 border-b border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-gray-800/50">
        <h3 class="font-bold text-text-main-light dark:text-white">薪资历史</h3>
      </div>
      <div class="overflow-y-auto flex-1 p-2 space-y-1">
        <button
          v-for="item in salaryList"
          :key="item.id"
          @click="currentId = item.id"
          class="w-full flex items-center justify-between p-3 rounded-lg text-left transition-all"
          :class="currentId === item.id ? 'bg-primary/10 border border-primary/20 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'"
        >
          <div>
            <p class="font-bold text-sm" :class="currentId === item.id ? 'text-primary' : 'text-text-main-light dark:text-white'">{{ item.month }}</p>
            <p class="text-xs text-text-secondary-light mt-0.5">实发: ¥{{ item.net.toLocaleString() }}</p>
          </div>
          <span
            class="text-[10px] px-1.5 py-0.5 rounded font-medium"
            :class="item.status === 'published' ? 'bg-emerald/10 text-emerald' : 'bg-orange-100 text-orange-600'"
          >
            {{ item.status === 'published' ? '已发放' : '核算中' }}
          </span>
        </button>
      </div>
    </div>

    <div class="flex-1 min-w-0 h-full">
      <SalarySlip v-if="currentData" :data="currentData" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import SalarySlip from '@/components/salary/SalarySlip.vue';

  // Mock Data - 后续从 API 获取
  const salaryList = [
    { id: 1, month: '2024-05', net: 24500, status: 'published' },
    { id: 2, month: '2024-04', net: 23800, status: 'published' },
    { id: 3, month: '2024-03', net: 28000, status: 'published' }, // 奖金月
    { id: 4, month: '2024-02', net: 23800, status: 'published' },
    { id: 5, month: '2024-01', net: 23800, status: 'published' },
  ];

  const currentId = ref(1);

  // 模拟详情数据
  const currentData = computed(() => {
    const meta = salaryList.find(i => i.id === currentId.value);
    if (!meta) return null;

    // 模拟不同月份的数据变化
    const isBonusMonth = meta.month === '2024-03';
    const baseSalary = 30000;
    const bonus = isBonusMonth ? 10000 : 0;
    const grossTotal = baseSalary + 2000 + 1000 + bonus; // Base + Housing + Transport

    return {
      month: meta.month,
      paymentDate: `${meta.month}-15`,
      netTotal: meta.net,
      grossTotal: grossTotal,
      incomes: {
        '基本工资': baseSalary,
        '住房补贴': 2000,
        '交通餐饮': 1000,
        ...(isBonusMonth ? { '季度奖金': 10000 } : {})
      },
      deductions: {
        pension: 2400, // 8%
        medical: 600,  // 2%
        unemployment: 150, // 0.5%
        fund: 3600,    // 12%
        tax: isBonusMonth ? 2250 : 1850 // 简单模拟个税
      }
    };
  });
</script>