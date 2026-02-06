import axios from 'axios';

// 基础响应结构
export interface ApiResponse<T> {
  code: number;
  data: T;
  msg?: string;
}

// Axios 实例配置
export const apiClient = axios.create({
  baseURL: '/api', // Vite 代理转发
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);