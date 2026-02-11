# 工作流背景 (Workflow Context)

## 1. 执行协议 (The 4-Step Loop)
面对任何功能开发或 Bug 修复，必须严格遵守以下四步闭环：

### 第一步：精确扫描 (Surgical Scan - 防上下文爆炸)
-   **动作**: 仅读取绝对必要的文件。
    -   *后端*: `schema.prisma` + 目标 Controller/Service。
    -   *前端*: 目标 Store + 1-2 个参考组件（如 `BaseCard.vue`）。
-   **约束**: **严禁**盲目读取整个依赖树。如果上下文过大，立即停止并在对话中确认范围。

### 第二步：思考与规划 (Plan)
-   **动作**: 在 `[架构师推理]` 标签下进行中文推演。
-   **内容**:
    -   技术选型确认。
    -   财务逻辑溯源（引用 `product.md`）。
    -   UI 风格参考（引用 `apps/client/tailwind.config.js`）。
    -   输出需修改的文件清单。

### 第三步：无损修改 (Execute)
-   **动作**: 生成完整的代码块或精确的 Diff。
-   **约束**: **严禁**使用 `// ... 原有逻辑保持不变` 等占位符。代码必须可直接运行。
-   **语言**: 逻辑代码使用英文，**注释必须使用简体中文**。

### 第四步：自我校验 (Verify)
-   **动作**:
    -   运行 TS 类型检查: `vue-tsc --noEmit` (前端) 或 `tsc --noEmit` (后端)。
    -   视觉一致性检查: 确认新代码的 Tailwind 类名与现有设计系统（圆角、阴影、间距）保持一致。

## 2. 前端设计铁律 (Frontend & Design Rules)
-   **Vue 文件结构**: 严格遵循 `<template>` -> `<script setup>` -> `<style>` 顺序。
-   **状态驱动**: 业务逻辑必须封装在 **Pinia Getters** 中，组件仅负责渲染 Props。
-   **设计系统**:
    -   开发前必须阅读 `apps/client/tailwind.config.js`。
    -   强制复用现有组件（如卡片）的样式（Padding/Shadow/Radius）。
    -   **严禁**使用硬编码颜色（如 `text-[#333]`），必须使用 Tailwind 语义化类名。

## 3. 后端开发铁律 (Backend Rules)
-   **Schema 优先**: 写查询前必须先查阅 `schema.prisma`。
-   **拒绝内存计算**: 严禁 `findMany` 后在 JS 层做聚合。
