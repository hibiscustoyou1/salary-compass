import { apiClient, type ApiResponse } from './http';

// --- Types ---
export interface TaxData {
  cards: {
    totalTax: number;
    effectiveRate: number;
    taxSaved: number;
  };
  chart: {
    months: string[];
    cumulativeIncome: number[];
    monthlyTax: number[];
  };
  deductionStructure: Array<{ name: string; value: number }>;
}

// --- API ---
export const taxApi = {
  getAnalysis: () =>
    apiClient.get<any, ApiResponse<TaxData>>('/tax/analysis')
};