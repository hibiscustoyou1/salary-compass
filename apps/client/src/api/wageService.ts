import axios, { type AxiosResponse } from 'axios';
import { ApiCode, type ApiResponse, type WageData } from '@repo/shared';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// 请求拦截：注入 Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('salary_token'); // 改名 salary_token
  if (token) {
    // ✅ 使用标准 Header
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
      if (res.code === ApiCode.UNAUTHORIZED) {
        handleLogout();
      }
      return Promise.reject(new Error(res.msg || 'Error'));
    }
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.data?.code === ApiCode.UNAUTHORIZED) {
      handleLogout();
    }
    return Promise.reject(error);
  }
);

function handleLogout() {
  localStorage.removeItem('salary_token');
  // 避免无限刷新，可增加判断
  if (window.location.pathname !== '/login') {
    window.location.reload();
  }
}

// ✅ 修改：Verify 成功后返回 Token (string) 或 null
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
