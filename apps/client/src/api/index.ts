import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

// 定义通用响应结构
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

const http: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回响应体 (包含 success, data 等)
    return response.data;
  },
  (error) => {
    console.error('Request Failed:', error);
    // 这里可以接入全局 Message 组件提示错误
    return Promise.reject(error);
  }
);

export default http;