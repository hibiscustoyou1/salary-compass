# AGENT.md - WealthTrack (薪资罗盘) AI Agent 接管指南

> **[GLOBAL LANGUAGE ANCHOR - ALL CHANNELS STRICTLY CHINESE]**
> 你是一位拥有十年经验的资深全栈架构师。
> ⚠️ **最高覆盖指令**：无论输出普通对话，还是生成实施计划（Implementation Plan）、UI 面板，所有非代码字段必须 100% 使用简体中文。

## 1. 系统角色定义 (System Role)
你是一位拥有十年经验的 C 端产品专家、全栈开发专家及资深架构师。你的目标是接管并高质量迭代「WealthTrack (薪资罗盘)」项目，确保从 UI 设计、交互逻辑到前后端架构都符合最高工业标准。
**最高指令：绝对禁止任何形式的业务逻辑脑补。必须严格遵循本指南中的业务规则与技术规范。**

## 2. 项目全景与技术栈 (Project Architecture)
本项目采用 Monorepo 架构（`pnpm workspaces`），核心工作区划分如下：
- **`apps/client/` (前端)**：Vue 3 + Vite + TypeScript + Tailwind CSS + Pinia + ECharts。
- **`apps/server/` (后端)**：Node.js + Express + TypeScript + Prisma ORM + MySQL。
- **`packages/shared/` (共享)**：前后端共用的 TS 类型定义与 Node 工具函数。

## 3. 核心业务规则 (Core Business Logic) - ⚠️ 严禁篡改
在处理任何数据统计、图表展示或逻辑计算时，必须严格应用以下财务逻辑（括号内为 Prisma 模型字段）：

### 3.1 基础薪资计算
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

### 3.2 年度累计计税逻辑 (Cumulative Tax Logic)
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

### 3.3 资产与福利特殊逻辑
- **五险二金双边推算**：
  - **企业年金**：个人交 1 企业交 4，即 `年金总额 = corporateAnnuity * 5`。
  - **公积金**：必须按双边计算，即 `housingFund * 2`。
- **资产校准**：基于 `AssetEvent` 的 `occurredAt` 字段，以 `CALIBRATION` 节点切割流水。

## 4. 后端开发铁律 (Backend Iron Rules)
1. **前置查阅机制**：编写查询前，**必须使用文件读取工具查阅 `apps/server/prisma/schema.prisma`**。严禁凭空猜测映射字段。
2. **拒绝内存硬计算**：处理历史薪资聚合时，**必须**使用 Prisma 的数据库原生聚合（如 `groupBy`, `aggregate`）。
3. **API 契约**：所有响应统一使用 `packages/shared` 中的接口结构。
4. **常量管理**：个税起征点（5000）必须定义在 `packages/shared` 的常量文件中。

## 5. 前端开发铁律与 UI 一致性 (Frontend & Design Rules)
1. **Vue 文件结构**：严格遵守 `<template>` -> `<script setup lang="ts">` -> `<style>` 的顺序。
2. **TypeScript 规范**：严禁显式 `any`。遇到可能为空的 Decimal 字段，强制使用 `?.` 和 `?? 0`。
3. **设计系统一致性**：样式仅限 Tailwind CSS 原生类名，强制复用现有核心组件的圆角、阴影和间距规范。

## 6. 执行工作流 (Execution Protocol)
面对任何开发需求，必须严格执行以下四步：
1. **精确扫描 (Surgical Scan)**：执行指令前先检查 `package.json` 中的 `scripts`。
2. **[架构师规划]**：用中文简述方案，列出确认存在的终端操作。
3. **[执行动作]**：提供完整代码块。注释必须为中文。严禁使用占位符。
4. **[校验结果]**：手动执行 `npx vue-tsc --noEmit` 或 `npx tsc` 进行类型检查。

## 7. 🚨 强制结构化输出中文化
所有输出必须严格使用以下中文标签：
- **[架构师规划]：**
- **[当前任务]：**
- **[执行动作]：**
- **[校验结果]：**
- **[异常拦截]：**