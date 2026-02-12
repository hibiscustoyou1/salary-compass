# 产品背景: WealthTrack (薪资罗盘)

## 产品愿景 (Vision)
为用户提供一个高精度、视觉惊艳的“薪资罗盘”，帮助他们清晰透视个人收入结构、五险二金缴纳详情及长期资产增长趋势。拒绝模糊，追求像素级的财务数据准确性。

## 核心业务逻辑 (Core Business Logic) - ⚠️ 严禁篡改

### 1. 核心计算公式 (Core Formulas)
在处理任何数据统计、图表展示或逻辑计算时，必须严格应用以下财务逻辑（括号内为 Prisma 模型字段）：

1.  **月度工资 (monthlyBase)**：
    `monthlyBase = baseSalary(岗位工资) + meritPay(月度绩效奖金) + subsidy(综合补贴) + otherWage(其他工资)`
2.  **当月额外收入 (extraIncome)**：
    `extraIncome = talentBonus(人才特区专项奖金) + quarterlyBonus(季度绩效奖金) + annualBonus(年度绩效奖金) + heatSubsidy(防暑降温费) + specialIncentive(专项激励)`
3.  **应发合计 (grossTotal)**：
    `grossTotal = monthlyBase + extraIncome`
4.  **扣款合计 (deductionTotal)**：
    `deductionTotal = unionFee(代扣工会费) + pension(养老保险) + medicalInsurance(医疗保险) + unemploymentIns(失业保险) + housingFund(住房公积金) + corporateAnnuity(企业年金) + taxAmount(本次扣税)`
5.  **实发合计 (netTotal)**：
    `netTotal = grossTotal - deductionTotal`
6.  **计税总额 (taxableBase)**：
    `taxableBase = grossTotal + mealAllowance(伙食补贴)`

### 2. 收入结构四分法 (Income Quadrants)
| 类别 | 包含项目 (Items) |
| :--- | :--- |
| **固定薪资** | 岗位工资 + 月度绩效 + 综合补贴 + 其他工资 |
| **绩效奖金** | 季度绩效 + 年度绩效 |
| **补贴福利** | 防暑降温 + 伙食补贴(计税) |
| **专项激励** | 人才特区 + 专项激励 |

### 3. 五险二金双边推算 (Social Insurance & Funds)
| 项目 | 个人缴纳 (Personal) | 企业缴纳 (Company) | 总额公式 (Total) |
| :--- | :--- | :--- | :--- |
| **企业年金** (Annuity) | `corporateAnnuity` | **4倍** (个人 * 4) | `corporateAnnuity * 5` |
| **住房公积金** (Housing) | `housingFund` | **1倍** (个人 * 1) | `housingFund * 2` |
| **养老/医疗/失业** | `pension`/`medical`/`unemployment` | *(无数据)* | `个人` (暂定) |

### 4. 资产校准 (Asset Calibration)
-   **基准**: 基于 `AssetEvent` 表的 `occurredAt` 字段。
-   **逻辑**: 以 `CALIBRATION` 时间节点为分界线切割流水，确保资产快照准确。

## 目标用户 (Target User)
-   **企业员工**: 拥有复杂薪资结构（底薪、绩效、奖金、补贴混杂）的用户，通过本系统看清实际到手收入与隐形福利（公司缴纳部分）。
