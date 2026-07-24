# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

这是一个用于薪酬/财富数据看板的 pnpm workspace monorepo：

- [apps/client/](apps/client/) — Vue 3 + Vite + TypeScript 前端，使用 Tailwind CSS，并通过 ECharts / vue-data-ui 展示图表。
- [apps/server/](apps/server/) — Express 5 + TypeScript API 服务，使用 Prisma 访问 MySQL。
- [packages/shared/](packages/shared/) — 前后端共享的 API 响应类型、薪酬数据类型，以及环境变量/路径辅助函数；按 common/node/browser 三类入口构建。
- [packages/tsconfig/](packages/tsconfig/) — 共享的严格 TypeScript 配置预设，区分 Node 与 DOM 环境。

本项目前端界面文案主要使用中文，继续使用中文文案即可。

## 常用命令

除非特别说明，以下命令都在仓库根目录执行。

```bash
# 安装依赖
pnpm install

# 解密本地环境配置；README 说明初始 .env.enc 密码为 "default"
VAULT_PASS=default pnpm vault:dec

# 修改 Prisma schema 后重新生成 Prisma Client
pnpm db:gen

# 执行 Prisma 迁移；需要 .env/.env.enc 中的 DATABASE_URL
pnpm db:migrate --name dev

# 并行启动前端和后端开发服务
pnpm dev

# 只构建共享包
pnpm build:shared

# 构建全部 workspace 的生产产物
pnpm build

# 运行 dist/ 中的生产服务
pnpm start

# 删除生成的构建产物
pnpm clean
```

按 package 范围执行的命令：

```bash
# 只启动前端开发服务
pnpm --filter client dev

# 前端类型检查 + 构建
pnpm --filter client build

# 只启动后端开发服务
pnpm --filter server dev

# 只构建后端；会执行 prisma:gen、tsup，并复制 Prisma 运行时文件
pnpm --filter server build

# 共享包 watch/build
pnpm --filter @repo/shared dev
pnpm --filter @repo/shared build
```

Docker 相关命令：

```bash
VAULT_PASS=... pnpm docker:build
VAULT_PASS=... pnpm docker:run
pnpm docker:stop
```

当前 workspace 的 package.json 中没有配置 lint 或 test 脚本，也没有单测运行命令。除非之后引入测试框架，否则可用对应的 build 命令作为主要验证手段。

## 环境变量与配置

- 环境变量加载逻辑在 [packages/shared/src/node/secure-env.ts](packages/shared/src/node/secure-env.ts)：优先加载明文 `.env`；如果不存在，则使用 `VAULT_PASS` 解密 `.env.enc`。
- 根目录 Prisma 脚本通过 `dotenv -e .env -- ...` 包裹，因此数据库命令需要 `.env` 存在，或由外部环境提供相关变量。
- API 服务和 Vite 配置都会通过 `@repo/shared/node` 的路径工具调用 `loadSecureEnv()`。
- 重要后端环境变量包括 `DATABASE_URL`、`ACCESS_KEY`、`JWT_SECRET`、`PORT`。
- 登录流程会在浏览器端对用户输入的访问密钥做 SHA-256 哈希，并与服务端 `ACCESS_KEY` 的哈希值比较；登录成功后将 JWT 存入 `localStorage`，key 为 `salary_token`。

## 架构说明

### 前端

- 入口文件是 [apps/client/src/main.ts](apps/client/src/main.ts)，它挂载 [apps/client/src/App.vue](apps/client/src/App.vue) 并注册 Pinia。
- 当前没有配置 Vue Router。[App.vue](apps/client/src/App.vue) 根据 `salary_token` 是否存在，直接在 [LoginView.vue](apps/client/src/views/LoginView.vue) 与 [SalaryDashboard.vue](apps/client/src/views/dashboard/SalaryDashboard.vue) 之间切换。
- API 访问集中在 [apps/client/src/api/wageService.ts](apps/client/src/api/wageService.ts)。Axios client 使用 `baseURL: '/api'`，自动注入 `Authorization: Bearer <salary_token>`，并在 API 或 HTTP 401 时清除 token 并刷新页面。
- [SalaryDashboard.vue](apps/client/src/views/dashboard/SalaryDashboard.vue) 管理看板顶层状态：当前菜单、选择年份、隐私模式、移动端侧边栏状态，以及加载遮罩的时序。
- 数据加载与聚合逻辑在 [apps/client/src/views/dashboard/composables/useSalaryData.ts](apps/client/src/views/dashboard/composables/useSalaryData.ts)。它会获取薪酬数据，按 year-month 聚合重复行中的数值字段，过滤掉应发工资非正数的数据，并按年月升序排序。
- 主题逻辑在 [apps/client/src/views/dashboard/composables/useTheme.ts](apps/client/src/views/dashboard/composables/useTheme.ts)，通过 Tailwind 的 `darkMode: 'class'` 应用暗色模式。
- 看板视图组件位于 [apps/client/src/views/dashboard/views/](apps/client/src/views/dashboard/views/)，这些视图组合使用 [apps/client/src/components/](apps/client/src/components/) 下的图表和表格组件。

### 后端

- 入口文件是 [apps/server/src/index.ts](apps/server/src/index.ts)：加载安全环境变量，创建 Express app，启用 CORS 和 JSON 解析，注册路由，并监听 `PORT`（默认 `3000`）。
- 路由在 [apps/server/src/routes/index.ts](apps/server/src/routes/index.ts) 中挂载到 `/api`。当前路由包括：
  - `POST /api/verify` — 公开的登录校验接口。
  - `GET /api/wages` — 受保护的薪酬数据接口。
- [apps/server/src/controllers/auth.controller.ts](apps/server/src/controllers/auth.controller.ts) 会比较浏览器传来的 SHA-256 key 与 `ACCESS_KEY` 的哈希值，验证通过后签发 7 天有效期的 JWT。
- [apps/server/src/middlewares/auth.middleware.ts](apps/server/src/middlewares/auth.middleware.ts) 校验受保护接口中的 `Authorization: Bearer <token>`。
- [apps/server/src/controllers/wage.controller.ts](apps/server/src/controllers/wage.controller.ts) 通过 Prisma `wage.findMany()` 查询数据，并按 year/month 倒序返回。
- [apps/server/src/utils/result.ts](apps/server/src/utils/result.ts) 使用共享的 `ApiResponse` 结构包装响应。多数失败响应会保持 HTTP 200，并在响应体的 `code` 中表达错误；认证失败处会按代码显式返回 HTTP 401。

### 共享包与 TypeScript 配置

- `@repo/shared` 从 `src/common` 导出通用类型，从 `src/node` 导出 Node-only 工具；`src/browser` 当前为空入口。
- [packages/shared/tsup.config.ts](packages/shared/tsup.config.ts) 会为 `common`、`node`、`browser` 三类入口构建 CJS/ESM 产物和类型声明。
- 前端和后端都使用 `@/*` 路径别名指向各自的 `src/*`。
- [packages/tsconfig/base.json](packages/tsconfig/base.json) 开启共享严格设置；[node.json](packages/tsconfig/node.json) 面向 CommonJS Node 环境；[dom.json](packages/tsconfig/dom.json) 面向浏览器和 bundler resolution。

### 数据库与部署

- Prisma schema 位于 [apps/server/prisma/schema.prisma](apps/server/prisma/schema.prisma)。`Wage` 模型映射到 MySQL 表 `mywage`，多个字段映射自中文数据库列名，并以 `year`、`month`、`employeeId` 组成联合主键。
- 后端构建使用 [apps/server/tsup.config.ts](apps/server/tsup.config.ts) 打包 CommonJS Node 产物，并通过 [apps/server/scripts/copy-deps.ts](apps/server/scripts/copy-deps.ts) 将 Prisma schema 和 query engine 文件复制到后端 dist 目录。
- 根目录 [Dockerfile](Dockerfile) 会构建所有 workspace，将后端 dist 和 `.env.enc` 复制到 `/app`，将前端 dist 复制到 Nginx html 目录，并运行 [docker/entrypoint.sh](docker/entrypoint.sh)。
- [docker/nginx.conf](docker/nginx.conf) 在 `/` 提供 Vue 静态资源，并将 `/api/` 代理到本机 Node 服务 `127.0.0.1:3000`。
