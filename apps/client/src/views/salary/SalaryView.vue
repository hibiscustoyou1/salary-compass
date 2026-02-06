<template>
  <div class="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
    <div class="w-full lg:w-80 flex flex-col bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden shrink-0">
      <div class="p-4 border-b border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-gray-800/50">
        <h3 class="font-bold text-text-main-light dark:text-white">薪资历史</h3>
      </div>
      <div class="overflow-y-auto flex-1 p-2 space-y-1">
        <button
          v-for="item in salaryList"
          :key="item.key"
          @click="handleSelect(item)"
          class="w-full flex items-center justify-between p-3 rounded-lg text-left transition-all"
          :class="activeKey === item.key ? 'bg-primary/10 border border-primary/20 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'"
        >
          <div>
            <p class="font-bold text-sm" :class="activeKey === item.key ? 'text-primary' : 'text-text-main-light dark:text-white'">{{ item.period }}</p>
            <p class="text-xs text-text-secondary-light mt-0.5">实发: ¥{{ item.net.toLocaleString() }}</p>
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald/10 text-emerald border border-emerald/20">已发放</span>
        </button>
      </div>
    </div>

    <div class="flex-1 min-w-0 h-full">
      <SalarySlip v-if="currentDetail" :data="currentDetail" />
      <div v-else class="h-full flex items-center justify-center text-text-secondary-light">
        请选择一个月查看工资单
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  // 按需引入 API 模块
  import { salaryApi, type SalaryListItem, type SalaryDetail } from '@/api/salary';
  import SalarySlip from '@/components/salary/SalarySlip.vue';

  const salaryList = ref<SalaryListItem[]>([]);
  const currentDetail = ref<SalaryDetail | null>(null);
  const activeKey = ref<string>('');

  const fetchList = async () => {
    try {
      const res = await salaryApi.getList();
      if (res.code === 200 && res.data.list.length > 0) {
        salaryList.value = res.data.list;
        // 默认选中第一条
        handleSelect(salaryList.value[0]);
      }
    } catch (e) {
      console.error('Failed to fetch salary list', e);
    }
  };

  const handleSelect = async (item: SalaryListItem) => {
    activeKey.value = item.key;
    try {
      // 传递 year 和 month
      const res = await salaryApi.getDetail(item.year, item.month);
      if (res.code === 200) {
        currentDetail.value = res.data;
      }
    } catch (e) {
      console.error('Failed to fetch salary detail', e);
    }
  };

  onMounted(() => {
    fetchList();
  });
</script>

<style scoped>
</style>