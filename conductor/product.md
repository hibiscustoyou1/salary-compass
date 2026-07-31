# 产品背景: WealthTrack (薪资罗盘)

## 产品愿景 (Vision)
为用户提供一个高精度、视觉惊艳的“薪资罗盘”，帮助他们清晰透视个人收入结构、五险二金缴纳详情及长期资产增长趋势。拒绝模糊，追求像素级的财务数据准确性。

## 核心业务逻辑 (Core Business Logic) - ⚠️ 严禁篡改

在处理任何数据统计、图表展示或逻辑计算时，必须严格应用以下财务逻辑（括号内为 Prisma 模型字段）：

### 1. 基础薪资计算 (Basic Salary Calculation)
1. **月度工资 (monthlyBase)**：
   `monthlyBase = baseSalary(岗位工资) + meritPay(月度绩效奖金) + subsidy(综合补贴) + otherWage(其他工资)`
2. **当月额外收入 (extraIncome)**：
   `extraIncome = talentBonus(人才特区专项奖金) + quarterlyBonus(季度绩效奖金) + annualBonus(年度绩效奖金) + heatSubsidy(防暑降温费) + specialIncentive(专项激励)`
3. **应发合计 (grossTotal)**：
   `grossTotal = monthlyBase + extraIncome`
4. **扣款合计 (deductionTotal)**：
   `deductionTotal = unionFee(代扣工会费) + pension(养老保险) + medicalInsurance(医疗保险) + unemploymentIns(失业保险) + housingFund(住房公积金) + corporateAnnuity(企业年金) + taxAmount(本次扣税)`
5. **实发合计 (netTotal)**：
   `netTotal = grossTotal - deductionTotal`
6. **当月计税基数 (taxableBase)**：
   `taxableBase = grossTotal + mealAllowance(伙食补贴)`

### 2. 年度累计计税逻辑 (Cumulative Tax Logic)
*注意：Σ 表示该年度内从 1 月至当前期间的累加值。*

7. **累计专项扣除 (cumDeduction)**：
   `cumDeduction = Σ[pension + medicalInsurance + unemploymentIns + housingFund]`
8. **累计专项附加扣除 (cumSpecialAddDeduction)**：
   `cumSpecialAddDeduction = rentDeduction(累计住房租金专项扣除) + childCareDeduction(累计婴幼儿照护专项扣除)`
9. **累计减除费用 (cumExemption)**：
   `TAX_THRESHOLD = 5000; cumExemption = TAX_THRESHOLD * period(当前月份/期间)`
10. **累计其他扣除 (cumOtherDeduction)**：
    `cumOtherDeduction = Σ(corporateAnnuity)`
11. **累计应纳税所得额 (cumTaxableIncome)**：
    `cumTaxableIncome = Σ(taxableBase) - cumDeduction - cumSpecialAddDeduction - cumExemption - cumOtherDeduction`

### 3. 资产与福利特殊逻辑 (Special Assets & Benefits)
- **五险二金双边推算**：
  - **企业年金**：个人交 1 企业交 4，即 `年金总额 = corporateAnnuity * 5`。
  - **公积金**：必须按双边计算，即 `housingFund * 2`。
- **资产校准**：基于 `AssetEvent` 的 `occurredAt` 字段，以 `CALIBRATION` 节点切割流水。

### 4. 收入结构四分法 (Income Quadrants)
| 类别 | 包含项目 (Items) |
| :--- | :--- |
| **固定薪资** | 岗位工资 + 月度绩效 + 综合补贴 + 其他工资 |
| **绩效奖金** | 季度绩效 + 年度绩效 |
| **补贴福利** | 防暑降温 + 伙食补贴(计税) |
| **专项激励** | 人才特区 + 专项激励 |

## 目标用户 (Target User)
-   **企业员工**: 拥有复杂薪资结构（底薪、绩效、奖金、补贴混杂）的用户，通过本系统看清实际到手收入与隐形福利（公司缴纳部分）。
