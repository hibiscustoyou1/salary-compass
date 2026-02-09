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
  providentFundTotal: string;  // 公积金总额
  annuityTotal: string;        // 年金总额 (新增)
  monthlyContribution: string; // 月缴存
  details: BenefitDetail[];
}

export const getBenefitsStats = () => {
  return request.get<any, ApiResponse<BenefitsStats>>('/benefits/stats');
};