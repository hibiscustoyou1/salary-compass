<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
      <div class="mb-6">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">
          🔒
        </div>
      </div>

      <h2 class="text-2xl font-bold text-gray-800 mb-2">身份验证</h2>
      <p class="text-gray-500 text-sm mb-6">请输入访问密钥以查看财富数据</p>

      <div class="space-y-4">
        <input
          v-model="inputKey"
          type="password"
          placeholder="输入 Access Key"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          @keyup.enter="handleLogin"
        />

        <button
          @click="handleLogin"
          :disabled="loading"
          class="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
          <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
          {{ loading ? '验证中...' : '解锁进入' }}
        </button>
      </div>

      <p v-if="errorMsg" class="text-red-500 text-sm mt-4 bg-red-50 py-2 rounded">
        {{ errorMsg }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { verifyKey } from '../api/wageService';
  import { sha256 } from '../utils/crypto';

  const emit = defineEmits(['login-success']);
  const inputKey = ref('');
  const loading = ref(false);
  const errorMsg = ref('');

  const handleLogin = async () => {
    if (!inputKey.value) return;

    loading.value = true;
    errorMsg.value = '';

    try {
      // 1. 计算 Hash
      const hashedKey = await sha256(inputKey.value);

      // 2. 验证并获取 Token
      const token = await verifyKey(hashedKey);

      if (token) {
        // 3. [关键] 存入 Token，Key 名称必须与 api/App.vue 保持一致
        localStorage.setItem('salary_token', token);
        emit('login-success');
      } else {
        errorMsg.value = '密钥错误，请重试';
      }
    } catch (e) {
      errorMsg.value = '连接服务器失败';
    } finally {
      loading.value = false;
    }
  };
</script>
