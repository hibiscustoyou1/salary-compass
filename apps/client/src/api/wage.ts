import request, { type ApiResponse } from './index';

// --- 类型定义 ---
export interface SalaryDetails {
  income: Record<string, string>;
  deductions: Record<string, string>;
}

export interface SalaryRecord {
  period: string; // "2024-06"
  year: number;
  gross: string;
  deduction: string;
  net: string;
  status: string;
  details: SalaryDetails;
  raw: {
    net: number;
    gross: number;
    tax: number;
  };
}

// --- 接口方法 ---
export const getSalaryHistory = () => {
  return request.get<any, ApiResponse<SalaryRecord[]>>('/salary/history');
};