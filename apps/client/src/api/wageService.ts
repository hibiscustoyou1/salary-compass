// client/src/api/wageService.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// [新增] 请求拦截器：每次请求自动带上 localStorage 里的 Key
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('salary_access_key');
  if (token) {
    config.headers['x-access-key'] = token;
  }
  return config;
});

// [新增] 响应拦截器：如果遇到 401 (密钥不对/过期)，强制登出
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('salary_access_key');
      // 触发一个全局事件或者简单的刷新页面让 App.vue 感知
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// [新增] 验证密码是否正确的 API
export const verifyKey = async (key: string): Promise<boolean> => {
  try {
    // 这里我们绕过拦截器，手动传 key 验证
    // 注意：后端需要对应一个 /api/verify 的 POST 接口 (在 index.ts 里加)
    // 但如果在 index.ts 里直接加了 post 路由且不在 /api 路由组里，或者 /api/verify 本身也被中间件拦截了
    // 这里我们可以利用“中间件只拦截 wageRoutes”的特性，
    // 或者简单点：verify 接口本身也走中间件逻辑，只要不报错就是成功
    
    // 为了简单，我们直接请求 verify 接口，利用 index.ts 里新增的路由
    // 注意：因为我们在 index.ts 里把 verify 放在了 wageRoutes 之外或者之前，需确保路径匹配
    await axios.post('/api/verify', { key });
    return true;
  } catch (e) {
    return false;
  }
};

// 完整定义后端返回的数据结构 (与 Prisma Schema 对应)
export interface WageData {
  year: number;
  month: number;
  
  // 收入
  grossPay: number;       // 应发合计
  netPay: number;         // 实发合计
  
  // 扣减详情
  tax: number;            // 个税
  pension: number;        // 养老
  medical: number;        // 医疗
  unemployment: number;   // 失业
  housingFund: number;    // 公积金
  annuity: number;        // 企业年金
  unionFee: number;       // 工会费
  deductionTotal: number; // 扣款合计
  
  baseSalary?: number;
  meritPay?: number;
  quarterlyBonus?: number;
  annualBonus?: number;
  talentBonus?: number;
  subsidy?: number;
  otherBonus?: number;
}

export const getWageData = async (): Promise<WageData[]> => {
  const response = await apiClient.get('/wages');
  // 后端返回结构 { success: true, data: [...] }
  return response.data.data;
};
