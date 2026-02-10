import request, { type ApiResponse } from './index';

// --- 类型定义 ---
export interface DashboardStats {
  netIncomeYTD: string;
  netIncomeChange: string;
  taxPaid: string;
  // [修改] 替换原有字段
  providentFundAccumulated: string; // 公积金累计
  annuityAccumulated: string;       // 年金累计
}

// --- 接口方法 ---
export const getDashboardStats = (year?: number) => {
  return request.get<any, ApiResponse<DashboardStats>>('/wage/dashboard/stats', {
    params: { year }
  });
};