<template>
  <div class="min-h-screen relative flex items-center justify-center bg-slate-50 dark:bg-zinc-950 transition-colors duration-500 font-sans selection:bg-primary selection:text-white">
    
    <!-- 极简几何网格背景 (非常克制，仅作质感点缀) -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
      <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
           style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 32px 32px; mask-image: radial-gradient(circle at center, black 30%, transparent 80%); -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 80%);">
      </div>
    </div>

    <!-- 登陆主容器 (轻量感悬浮卡片) -->
    <div class="relative z-10 w-full max-w-[420px] px-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      <!-- 品牌信息 -->
      <div class="text-center mb-10">
        <div class="mx-auto w-16 h-16 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-4xl text-primary font-light">finance_mode</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 mb-2">
          薪资罗盘
        </h1>
        <p class="text-slate-500 dark:text-zinc-400 text-sm">
          您的私人财富分析中枢
        </p>
      </div>

      <!-- 交互表单面板 -->
      <div class="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 rounded-[24px] shadow-xl shadow-slate-200/50 dark:shadow-black/40 p-8">
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          
          <!-- 密码输入组 -->
          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-slate-700 dark:text-zinc-300 ml-1">
              授权访问
            </label>
            <div class="relative group mt-1">
              <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-zinc-500 transition-colors group-focus-within:text-primary">
                <span class="material-symbols-outlined text-[20px]">lock</span>
              </span>
              <input 
                id="password" 
                v-model="password" 
                type="password" 
                required 
                placeholder="请输入您的系统访问密码"
                class="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 outline-none text-sm"
                :class="{ 'opacity-60 pointer-events-none': authStore.isLoading }"
              />
            </div>
          </div>

          <!-- 精致柔和的错误回馈 (平缓无恐吓感) -->
          <Transition name="fade-slide">
            <div v-if="authStore.error" class="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/50">
              <span class="material-symbols-outlined text-amber-500 text-[20px] mt-0.5">info</span>
              <span class="text-sm text-amber-700 dark:text-amber-400/90 leading-tight">
                {{ authStore.error.includes('密码') ? '访问受阻：密码似乎有误，请重新核对后再试。' : authStore.error }}
              </span>
            </div>
          </Transition>

          <!-- 全尺寸验证按钮 -->
          <button 
            type="submit" 
            :disabled="authStore.isLoading || !password"
            class="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 disabled:bg-slate-300 dark:disabled:bg-zinc-800 disabled:text-slate-500 dark:disabled:text-zinc-500 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98] mt-2"
          >
            <span v-if="authStore.isLoading" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
            <span v-else class="tracking-wide">进入系统</span>
          </button>
        </form>

      </div>
      
      <!-- 极简底部印记 -->
      <div class="text-center mt-10">
        <p class="text-xs text-slate-400 dark:text-zinc-600 flex items-center justify-center gap-1.5">
          <span class="material-symbols-outlined text-[14px]">shield</span>
          安全的数据加密保障
        </p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  // 清理可能因为登出带有的旧版状态错误
  authStore.error = null;
});

const handleLogin = async () => {
  if (!password.value) return;
  const success = await authStore.loginAction(password.value);
  if (success) {
    router.push('/dashboard');
  }
};
</script>

<style scoped>
/* 柔和的警报出场动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
