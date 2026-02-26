<template>
  <aside :class="[
    uiStore.isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    'fixed inset-y-0 left-0 z-50 lg:relative transition-all duration-300 ease-in-out',
    'flex flex-col w-72 bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark h-full shrink-0 shadow-2xl lg:shadow-none'
  ]">
    <div class="p-6 flex flex-col h-full gap-8">
      <div class="flex items-center gap-3 flex-shrink-0">
        <div
          class="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white shadow-lg shadow-blue-900/20">
          <span class="material-symbols-outlined overflow-hidden w-6 h-6 select-none">finance_mode</span>
        </div>
        <h2 class="text-xl font-bold tracking-tight text-primary dark:text-blue-400">WealthTrack</h2>
      </div>

      <div
        class="flex items-center gap-3 px-3 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border-light dark:border-border-dark flex-shrink-0">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar"
          class="w-10 h-10 rounded-full border-2 border-white dark:border-slate-600 shadow-sm bg-white">
        <div class="flex flex-col overflow-hidden">
          <span class="text-sm font-bold truncate text-text-main-light dark:text-text-main-dark">Alex Morgan</span>
          <span class="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">高级合伙人</span>
        </div>
      </div>

      <nav class="flex flex-col gap-2 flex-1 overflow-y-auto">
        <a v-for="tab in tabs" :key="tab.id" @click.prevent="handleNavigation(tab.id)" :class="[
          route.name === tab.id
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-blue-400',
          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer'
        ]">
          <span
            class="material-symbols-outlined group-hover:scale-110 transition-transform overflow-hidden w-6 h-6 select-none text-center">{{
              tab.icon }}</span>
          <span class="text-sm font-medium">{{ tab.label }}</span>
        </a>
      </nav>

      <div class="flex flex-col gap-4 mt-auto flex-shrink-0">
        <div class="p-4 rounded-xl text-white relative overflow-hidden group transition-colors duration-300"
          :class="privacyMode ? 'bg-gradient-to-br from-primary to-blue-900' : 'bg-slate-700 dark:bg-slate-800'">
          <div
            class="absolute top-0 right-0 p-2 opacity-10 transform group-hover:scale-125 transition-transform duration-500">
            <span class="material-symbols-outlined text-6xl select-none">{{ privacyMode ? 'lock' : 'lock_open' }}</span>
          </div>
          <p class="text-xs font-medium opacity-80 mb-1">安全状态</p>
          <div class="flex items-center gap-2">
            <span class="font-bold tracking-wide">{{ privacyMode ? '已加密隐藏' : '标准模式' }}</span>
            <span class="material-icons-round text-sm overflow-hidden w-4 h-4 select-none"
              :class="privacyMode ? 'text-green-400' : 'text-gray-400'">
              {{ privacyMode ? 'check_circle' : 'info' }}
            </span>
          </div>
        </div>

        <button @click="showLogoutModal = true"
          class="flex w-full items-center justify-center gap-2 rounded-xl h-10 px-4 border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-custom transition-colors text-sm font-semibold">
          <span class="material-symbols-outlined text-lg overflow-hidden w-5 h-5 select-none text-center">logout</span>
          <span>退出登录</span>
        </button>
      </div>
    </div>
  </aside>

  <!-- 高质感退出登录二次确认模态框 -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showLogoutModal" class="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
        <!-- 模糊遮罩 (优化了模糊进入的过渡) -->
        <Transition enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-300 ease-in" enter-from-class="opacity-0 backdrop-blur-none"
          enter-to-class="opacity-100 backdrop-blur-sm" leave-from-class="opacity-100 backdrop-blur-sm"
          leave-to-class="opacity-0 backdrop-blur-none">
          <div v-if="showLogoutModal" class="absolute inset-0 bg-slate-900/40 dark:bg-black/60"
            @click="showLogoutModal = false"></div>
        </Transition>

        <!-- 卡片主体 -->
        <div
          class="relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl shadow-black/20 w-full max-w-[340px] overflow-hidden transform transition-all">

          <div class="p-6">
            <div class="flex items-center gap-4 mb-4">
              <div
                class="flex-shrink-0 w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <span class="material-symbols-outlined text-red-500 text-2xl">logout</span>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-zinc-100">退出系统</h3>
                <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">确认要注销当前访问凭证吗？</p>
              </div>
            </div>
          </div>

          <!-- 底部操作栏 -->
          <div
            class="px-6 py-4 bg-slate-50 dark:bg-zinc-950/50 flex items-center justify-end gap-3 rounded-b-2xl border-t border-slate-100 dark:border-zinc-800">
            <button @click="showLogoutModal = false" :disabled="isLoggingOut"
              class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors tracking-wide disabled:opacity-50">
              保持登录
            </button>
            <button @click="confirmLogout" :disabled="isLoggingOut"
              class="relative flex items-center justify-center min-w-[88px] px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-500/20 transition-all tracking-wide disabled:bg-red-400">
              <span v-if="isLoggingOut" class="absolute inset-x-0 flex items-center justify-center">
                <span class="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full"></span>
              </span>
              <span :class="{ 'opacity-0': isLoggingOut }">确认退出</span>
            </button>
          </div>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store'; // [新增] 引入 auth store
import { useUIStore } from '@/stores/ui.store';

defineProps<{
  privacyMode: boolean;
}>();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore(); // [新增] 初始化 auth store
const uiStore = useUIStore();

// 登出弹窗状态
const showLogoutModal = ref(false);
const isLoggingOut = ref(false);

// 确认登出处理
const confirmLogout = async () => {
  isLoggingOut.value = true;

  // 增加一个极短的视觉缓冲延迟，增强安全退出的“卸载感”
  await new Promise(resolve => setTimeout(resolve, 600));

  authStore.logoutAction();
  showLogoutModal.value = false;
  isLoggingOut.value = false;
  router.push('/login');
};

// 动态生成菜单项 (适应扁平化路由)
const tabs = computed(() => {
  // 直接遍历所有路由，筛选出配置了 menuOrder 的项
  return router.options.routes
    .filter(r => r.meta && !r.meta.hidden && r.meta.menuOrder)
    .sort((a, b) => (Number(a.meta?.menuOrder) || 0) - (Number(b.meta?.menuOrder) || 0))
    .map(r => ({
      id: r.name as string,
      label: r.meta?.title as string,
      icon: r.meta?.icon as string,
      path: r.path
    }));
});

// 处理编程式导航
const handleNavigation = (name: string) => {
  if (route.name !== name) {
    router.push({ name });
  }
  // 移动端点击导航项后自动关闭抽屉
  uiStore.closeMobileMenu();
};
</script>

<style scoped>
/* 模态框极简平滑进出动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.modal-fade-enter-from .relative,
.modal-fade-leave-to .relative {
  transform: scale(0.96) translateY(10px);
}
</style>