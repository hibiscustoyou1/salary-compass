import request, { type ApiResponse } from './index';

// --- 类型定义 ---
export interface DashboardStats {
  netIncomeYTD: string;
  taxPaid: string;
  variableIncomeRatio: string;
  hiddenWealth: string;
}

// --- 接口方法 ---
export const getDashboardStats = () => {
  return request.get<any, ApiResponse<DashboardStats>>('/dashboard/stats');
};