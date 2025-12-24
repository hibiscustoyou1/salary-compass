import axios, { type AxiosResponse } from 'axios';
import { ApiCode, type ApiResponse, type WageData } from '@repo/shared';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// 请求拦截：注入 Token
apiClient.interceptors.request.use((config) => {
  // [关键] 必须与 App.vue 和 LoginView.vue 使用相同的 Key
  const token = localStorage.getItem('salary_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截：处理 401
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    if (res.code === ApiCode.SUCCESS) {
      return response;
    } else {
      // 业务逻辑层面的 401 (比如 Token 过期)
      if (res.code === ApiCode.UNAUTHORIZED) {
        handleLogout();
      }
      return Promise.reject(new Error(res.msg || 'Error'));
    }
  },
  (error) => {
    // HTTP 层面的 401
    if (error.response?.status === 401 || error.response?.data?.code === ApiCode.UNAUTHORIZED) {
      handleLogout();
    }
    return Promise.reject(error);
  }
);

function handleLogout() {
  localStorage.removeItem('salary_token');
  // 如果当前不在登录页，则刷新跳转，触发 App.vue 的检查逻辑
  if (window.location.pathname !== '/login') {
    window.location.reload();
  }
}

// 验证接口：返回 Token
export const verifyKey = async (key: string): Promise<string | null> => {
  try {
    const res = await apiClient.post<ApiResponse<{ token: string }>>('/verify', { key });
    if (res.data.code === ApiCode.SUCCESS && res.data.data?.token) {
      return res.data.data.token;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const getWageData = async (): Promise<WageData[]> => {
  const response = await apiClient.get<ApiResponse<WageData[]>>('/wages');
  return response.data.data;
};

export type { WageData };
