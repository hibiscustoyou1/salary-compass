import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { ApiResponse } from '@repo/shared'; // 引入共享类型

const http: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 直接返回响应体 (包含 success, data 等)
    return response.data as any; // 返回拦截器拆包后的数据
  },
  (error) => {
    console.error('Request Failed:', error);
    return Promise.reject(error);
  }
);

export default http;
export type { ApiResponse };