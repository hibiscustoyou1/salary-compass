/**
 * 中国个人所得税税率表（综合所得适用）
 * 应纳税额 = 应纳税所得额 * 最高适用税率 - 速算扣除数
 * * 字段说明：
 * @property {number} min - 该档位金额下限（不含）
 * @property {number} max - 该档位金额上限（含）
 * @property {number} rate - 适用税率（小数形式，如 0.03 代表 3%）
 * @property {number} deduction - 速算扣除数（用于简化阶梯计算的修正值）
 * @property {string} label - 显示标签
 */
export const TAX_BRACKETS = [
  { min: 0, max: 36000, rate: 0.03, deduction: 0, label: '3% 阶梯' },
  { min: 36000, max: 144000, rate: 0.10, deduction: 2520, label: '10% 阶梯' },
  { min: 144000, max: 300000, rate: 0.20, deduction: 16920, label: '20% 阶梯' },
  { min: 300000, max: 420000, rate: 0.25, deduction: 31920, label: '25% 阶梯' },
  { min: 420000, max: 660000, rate: 0.30, deduction: 52920, label: '30% 阶梯' },
  { min: 660000, max: 960000, rate: 0.35, deduction: 85920, label: '35% 阶梯' },
  { min: 960000, max: Infinity, rate: 0.45, deduction: 181920, label: '45% 阶梯' }
];