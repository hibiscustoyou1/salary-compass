// [修改] 去掉中间的 00，使用标准 HTTP 状态码风格
export enum ApiCode {
  SUCCESS = 200,        // 成功
  FAIL = 500,           // 服务器内部错误
  UNAUTHORIZED = 401,   // 未授权 (Token失效/错误)
  FORBIDDEN = 403,      // 无权限
  NOT_FOUND = 404,      // 资源不存在
}

// 统一响应结构 (保持不变)
export interface ApiResponse<T = any> {
  code: ApiCode;
  data: T;
  msg: string;
}

export interface WageData {
  id: number;
  year: number;
  month: number;
  grossPay: number;
  netPay: number;
  tax: number;
  pension: number;
  medical: number;
  unemployment: number;
  housingFund: number;
  annuity: number;
  unionFee: number;
  deductionTotal: number;
  baseSalary: number;
  meritPay: number;
  quarterlyBonus: number;
  annualBonus: number;
  talentBonus: number;
  subsidy: number;
  otherBonus: number;
}
