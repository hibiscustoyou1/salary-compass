import { apiClient, type ApiResponse } from './http';

// --- Types ---
export interface SalaryListItem {
  key: string;
  year: number;
  month: number;
  period: string; // "2024-05"
  gross: number;
  net: number;
  status: string;
}

export interface SalaryDetail {
  month: string;
  paymentDate: string;
  grossTotal: number;
  netTotal: number;
  incomes: Record<string, number>;
  deductions: {
    pension: number;
    medical: number;
    unemployment: number;
    fund: number;
    tax: number;
    annuity: number;
    union?: number;
  };
}

// --- API ---
export const salaryApi = {
  getList: (page = 1, pageSize = 12) =>
    apiClient.get<any, ApiResponse<{ total: number; list: SalaryListItem[] }>>('/salary/list', {
      params: { page, pageSize }
    }),

  getDetail: (year: number, month: number) =>
    apiClient.get<any, ApiResponse<SalaryDetail>>('/salary/detail', {
      params: { year, month }
    })
};