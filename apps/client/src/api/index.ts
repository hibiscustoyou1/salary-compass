import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { ApiResponse } from '@repo/shared'; // 引入共享类型

const http: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response.data as any;
  },
  (error) => {
    console.error('Request Failed:', error);
    if (error.response?.status === 401) {
      // Token 无效或过期，清除后跳回登录页
      localStorage.removeItem('token');
      // 由于这里处于非 Vue 组件环境，直接使用 window.location.href 重定向更稳妥，或者通过全局导入 router 实例
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default http;
export type { ApiResponse };