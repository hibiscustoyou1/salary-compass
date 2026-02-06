import { apiClient, type ApiResponse } from './http';

// --- Types ---
export interface DashboardData {
  cards: {
    netIncome: number;
    taxPaid: number;
    hiddenWealth: number;
    variableRatio: number;
  };
  charts: {
    trend: {
      categories: string[];
      gross: number[];
      net: number[];
    };
    structure: {
      fixed: number;
      bonus: number;
      rsu: number;
    };
    cashFlow: {
      gross: number;
      tax: number;
      pension: number;
      housing: number;
      net: number;
    };
  };
}

// --- API ---
export const dashboardApi = {
  getOverview: () =>
    apiClient.get<any, ApiResponse<DashboardData>>('/dashboard/overview')
};