# 技术栈背景 (Tech Stack Context)

## 系统架构 (Architecture)
-   **Monorepo**: 使用 `pnpm workspaces` 管理。
    -   `apps/client`: 前端应用
    -   `apps/server`: 后端服务
    -   `packages/shared`: 前后端共享类型定义与工具库

## 核心依赖 (Core Dependencies)

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

## 开发环境 (Environment)
-   **包管理器**: pnpm 10.21.0
-   **规范检查**: ESLint / Prettier (根目录配置)

## 关键架构决策 (Architectural Decisions)
1.  **拒绝隐式 Any**: 开启严格的 TypeScript 配置，禁止 `any` 蔓延。
2.  **数据库原生聚合**: 所有涉及金额汇总（Sum）、平均值（Avg）的计算，**必须**使用 Prisma Aggregate (`groupBy`, `aggregate`) 下推至 MySQL 执行。严禁在 Node.js 内存中遍历全表数据。
3.  **DTO 共享**: 所有 API 的请求/响应接口定义，必须统一存放于 `@repo/shared`，确保前后端契约一致。
