import axios, { type AxiosResponse } from 'axios';
import { ApiCode, type ApiResponse, type Wage } from '@repo/shared';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('salary_access_key');
  if (token) {
    config.headers['x-access-key'] = token;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    
    // [自动适配] 这里的 ApiCode.SUCCESS 现在就是 200
    if (res.code === ApiCode.SUCCESS) {
      return response;
    } else {
      // [自动适配] 这里的 ApiCode.UNAUTHORIZED 现在就是 401
      if (res.code === ApiCode.UNAUTHORIZED) {
        handleLogout();
      }
      return Promise.reject(new Error(res.msg || 'Error'));
    }
  },
  (error) => {
    if (error.response) {
      // 兼容逻辑：HTTP 401 或 Body code 401 都会触发登出
      if (error.response.status === 401 || error.response.data?.code === ApiCode.UNAUTHORIZED) {
        handleLogout();
      }
    }
    return Promise.reject(error);
  }
);

function handleLogout() {
  localStorage.removeItem('salary_access_key');
  window.location.reload();
}

export const verifyKey = async (key: string): Promise<boolean> => {
  try {
    await apiClient.post<ApiResponse>('/verify', { key });
    return true;
  } catch (e) {
    return false;
  }
};

export const getWageData = async (): Promise<Wage[]> => {
  const response = await apiClient.get<ApiResponse<Wage[]>>('/wages');
  return response.data.data;
};

export type { Wage };
