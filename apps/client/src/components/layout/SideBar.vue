<template>
  <aside class="flex flex-col w-72 bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark h-full shrink-0 transition-colors duration-200 z-20">
    <div class="p-6 flex flex-col h-full gap-8">
      <div class="flex items-center gap-3 flex-shrink-0">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white shadow-lg shadow-blue-900/20">
          <span class="material-symbols-outlined overflow-hidden w-6 h-6 select-none">finance_mode</span>
        </div>
        <h2 class="text-xl font-bold tracking-tight text-primary dark:text-blue-400">WealthTrack</h2>
      </div>

      <div class="flex items-center gap-3 px-3 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border-light dark:border-border-dark flex-shrink-0">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
             alt="Avatar" class="w-10 h-10 rounded-full border-2 border-white dark:border-slate-600 shadow-sm bg-white">
        <div class="flex flex-col overflow-hidden">
          <span class="text-sm font-bold truncate text-text-main-light dark:text-text-main-dark">Alex Morgan</span>
          <span class="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">高级合伙人</span>
        </div>
      </div>

      <nav class="flex flex-col gap-2 flex-1 overflow-y-auto">
        <a v-for="tab in tabs" :key="tab.id" href="#"
           @click.prevent="navigateTo(tab.id)"
           :class="[
             modelValue === tab.id
             ? 'bg-primary text-white shadow-md shadow-primary/20'
             : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-blue-400',
             'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group'
           ]">
          <span class="material-symbols-outlined group-hover:scale-110 transition-transform overflow-hidden w-6 h-6 select-none text-center">{{ tab.icon }}</span>
          <span class="text-sm font-medium">{{ tab.label }}</span>
        </a>
      </nav>

      <div class="flex flex-col gap-4 mt-auto flex-shrink-0">
        <div class="p-4 rounded-xl text-white relative overflow-hidden group transition-colors duration-300"
             :class="privacyMode ? 'bg-gradient-to-br from-primary to-blue-900' : 'bg-slate-700 dark:bg-slate-800'">
          <div class="absolute top-0 right-0 p-2 opacity-10 transform group-hover:scale-125 transition-transform duration-500">
            <span class="material-symbols-outlined text-6xl select-none">{{ privacyMode ? 'lock' : 'lock_open' }}</span>
          </div>
          <p class="text-xs font-medium opacity-80 mb-1">安全状态</p>
          <div class="flex items-center gap-2">
            <span class="font-bold tracking-wide">{{ privacyMode ? '已加密隐藏' : '标准模式' }}</span>
            <span class="material-icons-round text-sm overflow-hidden w-4 h-4 select-none" :class="privacyMode ? 'text-green-400' : 'text-gray-400'">
                  {{ privacyMode ? 'check_circle' : 'info' }}
                </span>
          </div>
        </div>

        <button class="flex w-full items-center justify-center gap-2 rounded-xl h-10 px-4 border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-custom transition-colors text-sm font-semibold">
          <span class="material-symbols-outlined text-lg overflow-hidden w-5 h-5 select-none text-center">logout</span>
          <span>退出登录</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';

  defineProps<{
    modelValue: string;
    privacyMode: boolean;
  }>();
  // 此时不再需要 emit 'update:modelValue'，因为状态由 URL 驱动

  const router = useRouter();

  const tabs = [
    { id: 'dashboard', label: '概览', icon: 'dashboard' },
    { id: 'salary', label: '薪资详情', icon: 'payments' },
    { id: 'tax', label: '税务分析', icon: 'account_balance' },
    { id: 'benefits', label: '福利预测', icon: 'trending_up' }
  ];

  const navigateTo = (name: string) => {
    router.push({ name });
  };
</script>