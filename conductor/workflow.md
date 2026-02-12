# 工作流背景 (Workflow Context)

## 1. 执行工作流 (Execution Protocol)
面对任何开发需求，必须严格执行以下四步：

1.  **精确扫描 (Surgical Scan)**：
    执行指令前先检查 `package.json` 中的 `scripts`。
2.  **[架构师规划]**：
    用中文简述方案，列出确认存在的终端操作。
3.  **[执行动作]**：
    提供完整代码块。注释必须为中文。严禁使用占位符。
4.  **[校验结果]**：
    手动执行 `npx vue-tsc --noEmit` 或 `npx tsc` 进行类型检查。

## 2. 后端开发铁律 (Backend Iron Rules)
1.  **前置查阅机制**：
    编写查询前，**必须使用文件读取工具查阅 `apps/server/prisma/schema.prisma`**。严禁凭空猜测映射字段。
2.  **拒绝内存硬计算**：
    处理历史薪资聚合时，**必须**使用 Prisma 的数据库原生聚合（如 `groupBy`, `aggregate`）。
3.  **API 契约**：
    所有响应统一使用 `packages/shared` 中的接口结构。

## 3. 前端开发铁律与 UI 一致性 (Frontend & Design Rules)
1.  **Vue 文件结构**：
    严格遵守 `<template>` -> `<script setup lang="ts">` -> `<style>` 的顺序。
2.  **TypeScript 规范**：
    严禁显式 `any`。遇到可能为空的 Decimal 字段，强制使用 `?.` 和 `?? 0`。
3.  **设计系统一致性**：
    样式仅限 Tailwind CSS 原生类名，强制复用现有核心组件的圆角、阴影和间距规范。

## 4. 🚨 强制结构化输出中文化
所有输出必须严格使用以下中文标签：
-   **[架构师规划]：**
-   **[当前任务]：**
-   **[执行动作]：**
-   **[校验结果]：**
-   **[异常拦截]：**
