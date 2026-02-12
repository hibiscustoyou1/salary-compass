# 技术栈背景 (Tech Stack Context)

## 1. 项目全景与架构 (Project Architecture)
本项目采用 Monorepo 架构（`pnpm workspaces`）：

-   **`apps/client` (前端)**：
    Vue 3 + Vite + TypeScript + Tailwind CSS + Pinia + ECharts。
-   **`apps/server` (后端)**：
    Node.js + Express + TypeScript + Prisma ORM + MySQL。
-   **`packages/shared` (共享)**：
    前后端共用的 TS 类型定义与 Node 工具函数。

## 2. 核心依赖锁定 (Core Dependencies)

### 前端 (`apps/client`)
-   **框架**: Vue 3.5.24 + Vite (Rolldown)
-   **语言**: TypeScript ~5.9.3
-   **样式**: **Tailwind CSS 3.4.18** (严格原子化类名，禁止手写 CSS)
-   **状态管理**: Pinia 3.0.4 (单一数据源)
-   **图表**: ECharts 6.0.0
-   **路由**: Vue Router 4.6.3

### 后端 (`apps/server`)
-   **运行时**: Node.js (v24 types)
-   **框架**: Express 5.1.0
-   **ORM**: Prisma 5.22.0
-   **数据库**: MySQL
-   **构建**: tsup

## 3. 开发环境 (Environment)
-   **包管理器**: pnpm 10.21.0
-   **规范检查**: ESLint / Prettier (根目录配置)

