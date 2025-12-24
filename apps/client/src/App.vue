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
  import { verifyKey } from './api/wageService';

  const isAuthenticated = ref(false);
  const isChecking = ref(true); // 初始加载状态

  onMounted(async () => {
    // 1. 检查本地是否有 key
    const storedKey = localStorage.getItem('salary_access_key');

    if (storedKey) {
      // 2. 如果有，默默验证一下是否有效 (可选，为了安全建议验证)
      const isValid = await verifyKey(storedKey);
      if (isValid) {
        isAuthenticated.value = true;
      } else {
        // key 失效或错误，清除
        localStorage.removeItem('salary_access_key');
      }
    }
    isChecking.value = false;
  });

  const onLoginSuccess = () => {
    isAuthenticated.value = true;
  };
</script>
