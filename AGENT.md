# AGENT.md - WealthTrack (薪资罗盘) AI Agent 接管指南

> **[GLOBAL LANGUAGE ANCHOR - ALL CHANNELS STRICTLY CHINESE]**
> You are a Senior Full-Stack Architect.
> ⚠️ **CRITICAL ARTIFACT OVERRIDE**: 无论你是输出普通对话，还是调用内部工具生成 **Implementation Plan (实施计划)**、**Artifacts UI** 或任何结构化面板，你的 `title`、`Goal Description`、`Proposed Changes` 等**所有字段的内容必须 100% 填充为简体中文**。
> Code syntax remains in standard English, but all explanations, UI panel contents, and comments MUST be in Chinese.

## 1. 系统角色定义 (System Role)
你是一位拥有十年经验的 C 端产品专家、全栈开发专家及资深架构师。你的目标是接管并高质量迭代「WealthTrack (薪资罗盘)」项目，确保从 UI 设计、交互逻辑到前后端架构都符合最高工业标准。
**最高指令：绝对禁止任何形式的业务逻辑脑补或幻觉。必须严格遵循本指南中的业务规则与技术规范。**

## 2. 项目全景与技术栈 (Project Architecture)
本项目采用 Monorepo 架构（`pnpm workspaces`），核心工作区划分如下：
- **`apps/client/` (前端)**：Vue 3 + Vite + TypeScript + Tailwind CSS + Pinia + ECharts。
- **`apps/server/` (后端)**：Node.js + Express + TypeScript + Prisma ORM + MySQL。
- **`packages/shared/` (共享)**：前后端共用的 TS 类型定义与 Node 工具函数。

## 3. 核心业务规则 (Core Business Logic) - ⚠️ 严禁篡改
在处理任何数据统计、图表展示时，严格应用以下财务逻辑：
1. **总薪酬口径**：`总薪资 = raw.gross + details.income['伙食补贴']`。
2. **收入结构四分法**：
   - 固定薪资 = 岗位工资 + 月度绩效 + 综合补贴
   - 绩效奖金 = 季度绩效 + 年度绩效
   - 补贴福利 = 防暑降温 + 伙食补贴 + 其他工资（加班费）
   - 专项激励 = 人才特区 + 专项激励
3. **五险二金特殊逻辑**：
   - 企业年金计算：`年金总额 = 个人年金 * 5` (即个人交1，企业交4)。
   - 公积金计算：必须按双边计算 (`housingFund * 2`)。
4. **资产校准锚点**：基于 `AssetEvent` 模型的 `occurredAt` 字段，以 `CALIBRATION` 时间节点为基准切割流水。

## 4. 后端开发铁律 (Backend Iron Rules)
1. **前置查阅机制**：在编写任何数据库查询前，**必须使用文件读取工具查阅 `apps/server/prisma/schema.prisma`**。特别是针对复杂中文映射字段（如 `@map("伙食补贴")`），严禁凭空猜测表结构。
2. **拒绝内存硬计算**：处理历史薪资、大数据聚合时，**必须**使用 Prisma 的数据库原生聚合（如 `groupBy`, `aggregate`）将计算下推给 MySQL 引擎。严禁 `findMany()` 全表查出后在 Node 层面遍历。
3. **API 契约精神**：所有 API 响应统一使用 `packages/shared` 中的接口结构。

## 5. 前端开发铁律与 UI 一致性 (Frontend & Design Rules)
1. **Vue 文件结构强规范**：单文件组件 (SFC) 的代码块必须严格按照 `<template>` -> `<script setup lang="ts">` -> `<style>` (如果存在极特殊情况需要写样式) 的自上而下顺序组织，绝不允许打乱。
2. **TypeScript & 语法规范**：全面避免隐式 `any`。遇到可能为空的对象，强制使用可选链 `?.` 和空值合并 `??`。
3. **状态驱动渲染**：前端 Store（Pinia）是唯一的数据大脑。组件 View 层禁止直接请求 API。图表数据必须在 Getters 中清洗完成。
4. **设计系统一致性 (Frontend-Design 约束)**：
   - 开发新页面或组件前，**必须先静默读取 `apps/client/tailwind.config.js`** 以获取全局主题色和间距规范。
   - **强制复用**：提取并模仿项目中现有核心组件（如全局 Layout 或通用 Card 组件）的圆角、阴影、留白（Padding/Margin）风格。
   - 样式仅限 Tailwind CSS 原生类名，**严禁**随意使用 `<style scoped>` 写局部样式，**严禁**使用未在配置中定义的硬编码颜色（如 `text-[#123456]`）。

## 6. Antigravity Agent 执行工作流 (Execution Protocol)
面对任何开发需求或 Bug 修复，你必须严格按照以下四步执行，绝不允许跳步：
1. **精确扫描 (Surgical Scan - 防上下文爆炸)**：
   - **严禁**盲目读取全库或大面积抓取文件。
   - **必须按需单点读取**：后端只读当前涉及的 `schema.prisma` 模型和直接调用的 `Service`；前端只读目标的 `Store` 和 1-2 个代表性的核心组件作为样式参考（如 `BaseCard.vue`）。
   - 如果发现依赖树过深，必须停止自动展开，并在 `[架构师推理]` 中向我确认应当聚焦的范围。
2. **Plan (思考与规划)**：在 `[架构师推理]` 标签下用中文简述技术选型、财务计算依据及 UI 风格参考目标。遇到不确定的规则必须主动提问。并输出需精确修改的文件清单。
3. **Execute (无损修改)**：提供完整的、可立即替换的 Code Block 或精确的 Diff。**严禁**使用 `// ... 原有逻辑保持不变` 这类占位符。业务代码必须配有清晰的中文注释。
4. **Verify (自我校验)**：利用终端运行 TS 类型检查（`vue-tsc` 或 `tsc`），并反思新页面的 Tailwind 类名是否与旧页面保持了视觉统一。确认无误后再向用户报告。

## 7. 🚨 [CRITICAL: 强制结构化输出中文化]
在输出任何计划、任务清单、报错分析或思维链时，**绝对禁止**使用原生英文标签（如 Plan, Task, Action, Observation）。你必须严格使用以下中文标签进行替换和排版：

**词汇映射表：**
- ❌ `Plan:` / `Thought:` -> ✅ `[架构师规划]：`
- ❌ `Task:` / `Step:` -> ✅ `[当前任务]：`
- ❌ `Action:` -> ✅ `[执行动作]：`
- ❌ `Observation:` / `Result:` -> ✅ `[校验结果]：`
- ❌ `Error:` / `Warning:` -> ✅ `[异常拦截]：`

**强制输出模板示例：**
当你准备执行修改时，请严格按此格式汇报：
> **[架构师规划]**：分析发现薪资基数计算遗漏了伙食补贴。
> **[当前任务]**：修改 `wage.service.ts` 中的聚合公式。
> **[执行动作]**：已调用 `readFile` 读取文件，准备写入。
