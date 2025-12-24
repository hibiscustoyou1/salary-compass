<template>
  <div v-if="isChecking" class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
  </div>

  <template v-else>
    <LoginView v-if="!isAuthenticated" @login-success="onLoginSuccess" />
    <SalaryDashboard v-else />
  </template>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import SalaryDashboard from './views/dashboard/SalaryDashboard.vue';
  import LoginView from './views/LoginView.vue';

  const isAuthenticated = ref(false);
  const isChecking = ref(true); // 初始加载状态

  onMounted(() => {
    // 1. [修复] 统一使用 salary_token
    const token = localStorage.getItem('salary_token');

    if (token) {
      // 2. [优化] 只要有 Token，先视为已登录。
      // 如果 Token 过期，SalaryDashboard 发起请求时会触发 401 拦截器自动登出。
      isAuthenticated.value = true;
    }

    isChecking.value = false;
  });

  const onLoginSuccess = () => {
    isAuthenticated.value = true;
  };
</script>
