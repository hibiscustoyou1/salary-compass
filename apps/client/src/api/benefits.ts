import { apiClient, type ApiResponse } from './http';

// --- Types ---
export interface BenefitsData {
  summary: {
    fundTotal: number;
    monthlyPayment: number;
    defaultRetireAge: number;
  };
  simulatorBase: {
    currentAge: number;
    balances: {
      fund: number;
      annuity: number;
      pension: number;
    };
    monthlyAdds: {
      fund: number;
      annuity: number;
      pension: number;
    };
  };
  details: {
    medical: { status: string; personal: number; company: number };
    unemployment: { months: number; coverage: number };
    injury: { status: string; amount: number };
  };
}

// --- API ---
export const benefitsApi = {
  getPrediction: () =>
    apiClient.get<any, ApiResponse<BenefitsData>>('/benefits/prediction')
};