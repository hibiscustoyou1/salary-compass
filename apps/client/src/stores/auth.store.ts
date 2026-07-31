import { defineStore } from 'pinia';
import { ref } from 'vue';
import http from '@/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token') || null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const setToken = (newToken: string | null) => {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  };

  const loginAction = async (password: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const res: any = await http.post('/auth/login', { password });
      if (res.success && res.data?.token) {
        setToken(res.data.token);
        return true;
      } else {
        error.value = res.error || '登录失败，凭证拒绝';
        return false;
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || '网络或服务器异常';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logoutAction = () => {
    setToken(null);
  };

  return {
    token,
    isLoading,
    error,
    loginAction,
    logoutAction,
  };
});
