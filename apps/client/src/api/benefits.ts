import request, { type ApiResponse } from './index';

export interface BenefitDetail {
  title: string;
  icon: string;
  color: string;
  status: string;
  progress: number;
  meta: {
    label: string;
    value: string;
  };
}

export interface BenefitsStats {
  providentFundTotal: string;
  annuityTotal: string;
  monthlyContribution: string;
  // [新增结构化数据]
  raw?: {
    providentFundTotal: number;
    annuityTotal: number;
  };
  monthlyBreakdown?: {
    provident: number;
    annuity: number;
    pension: number;
  };
  details: BenefitDetail[];
}

export const getBenefitsStats = () => {
  return request.get<any, ApiResponse<BenefitsStats>>('/wage/benefits/stats');
};