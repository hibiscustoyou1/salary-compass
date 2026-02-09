import request, { type ApiResponse } from './index';

// --- 类型定义 ---
export interface DashboardStats {
  netIncomeYTD: string;
  taxPaid: string;
  variableIncomeRatio: string;
  hiddenWealth: string;
}

// --- 接口方法 ---
// [修改] 增加可选参数 year
export const getDashboardStats = (year?: number) => {
  return request.get<any, ApiResponse<DashboardStats>>('/dashboard/stats', {
    params: { year }
  });
};