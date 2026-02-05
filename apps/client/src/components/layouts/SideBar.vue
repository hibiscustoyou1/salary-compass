<template>
  <aside class="hidden lg:flex flex-col w-72 bg-white dark:bg-card-dark border-r border-border-light dark:border-border-dark h-screen sticky top-0 z-20 transition-colors duration-200">
    <div class="p-6 flex flex-col h-full justify-between">
      <div class="flex flex-col gap-8">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white">
            <span class="material-symbols-outlined">finance_mode</span>
          </div>
          <h2 class="text-xl font-bold tracking-tight text-primary dark:text-blue-400">WealthTrack</h2>
        </div>

        <nav class="flex flex-col gap-2">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
            :class="[
              isActive(item.path)
                ? 'bg-primary text-white shadow-sm hover:shadow-md'
                : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-gray-800'
            ]"
          >
            <span class="material-symbols-outlined">{{ item.icon }}</span>
            <span class="text-sm font-medium">{{ item.name }}</span>
          </router-link>
        </nav>
      </div>

      <div class="flex flex-col gap-4">
        <div class="p-4 rounded-xl bg-gradient-to-br from-primary to-blue-900 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 p-2 opacity-10">
            <span class="material-symbols-outlined text-6xl">lock</span>
          </div>
          <p class="text-xs font-medium opacity-80 mb-1">安全状态</p>
          <div class="flex items-center gap-2">
            <span class="font-bold text-white tracking-wide">已加密</span>
            <span class="material-icons-round text-sm text-green-400">check_circle</span>
          </div>
        </div>
        <button class="flex w-full items-center justify-center gap-2 rounded-lg h-10 px-4 border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-gray-800 transition-colors text-sm font-semibold">
          <span class="material-symbols-outlined text-lg">logout</span>
          <span>退出登录</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

const menuItems = [
  { name: '概览', icon: 'dashboard', path: '/dashboard' },
  { name: '薪资详情', icon: 'payments', path: '/salary' },
  { name: '税务分析', icon: 'account_balance', path: '/tax' },
  { name: '福利预测', icon: 'trending_up', path: '/benefits' },
  { name: '投资组合', icon: 'pie_chart', path: '/portfolio' },
];

const isActive = (path: string) => route.path.startsWith(path);
</script>