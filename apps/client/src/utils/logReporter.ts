import axios from 'axios';

// 使用 sendBeacon 或简单的 fetch，不依赖现有 axios 实例防止死循环
const report = (data: any) => {
  try {
    // 尽量使用 sendBeacon (页面关闭也能发)，不支持则降级为 fetch
    const url = '/api/log/report';
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (e) {
    console.error('日志上报失败', e);
  }
};

export const initLogger = (app: any) => {
  // 1. 捕获 Vue 组件错误
  app.config.errorHandler = (err: any, instance: any, info: string) => {
    console.error('Vue Error:', err);
    report({
      level: 'error',
      message: err.message || 'Vue Component Error',
      stack: err.stack,
      info: { componentInfo: info, url: window.location.href }
    });
  };
  
  // 2. 捕获全局 JS 错误 (如 undefined 报错)
  window.onerror = (message, source, lineno, colno, error) => {
    report({
      level: 'error',
      message: String(message),
      stack: error?.stack,
      info: { source, lineno, colno, url: window.location.href }
    });
  };
  
  // 3. 捕获未处理的 Promise (如 Axios 请求失败未 catch)
  window.onunhandledrejection = (event) => {
    // 过滤掉我们自己取消请求的错误
    if (event.reason?.message === 'canceled') return;
    
    report({
      level: 'error',
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      info: { url: window.location.href }
    });
  };
};
