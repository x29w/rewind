# Rewind — 总体架构设计

> 版本：v1.0 | 日期：2026-04-29

---

## 一、项目组成

Rewind 由 3 个独立应用组成，通过 pnpm workspace Monorepo 管理：

```
rewind/
├── packages/
│   ├── sdk/          # 应用 1：前端采集 SDK
│   ├── server/       # 应用 2：后端服务
│   └── dashboard/    # 应用 3：可视化平台
├── packages/shared/  # 共享类型定义（非应用，仅类型包）
├── docs/
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

| 应用 | 技术栈 | 产物 | 部署方式 |
|------|--------|------|----------|
| **@rewind-dev/sdk** | TypeScript + Rollup | npm 包（UMD + ESM） | 业务项目 `npm install` |
| **@rewind-dev/server** | NestJS + Prisma + PostgreSQL + Redis | Docker 容器 / Node.js 进程 | 服务器部署 |
| **@rewind-dev/dashboard** | React + Vite + Ant Design + Redux Toolkit + TanStack Router | 静态文件（HTML/JS/CSS） | Nginx / 静态托管 |
| **@rewind-dev/shared** | TypeScript（仅类型） | 无运行时产物 | 被其他三个包引用 |

---

## 二、应用间通信

```
┌─────────────────────┐
│  用户浏览器（业务应用） │
│  ┌─────────────────┐ │
│  │ @rewind-dev/sdk│ │
│  └────────┬────────┘ │
└───────────┼──────────┘
            │ POST /api/v1/report（API Key 认证）
            │ POST /api/v1/sourcemap
            ▼
┌───────────────────────┐       ┌──────────────┐
│ @rewind-dev/server   │◄──────│  PostgreSQL   │
│                       │◄──────│  Redis        │
│  - 数据接收 & 处理     │       └──────────────┘
│  - Issue 管理          │
│  - AI 分析             │◄───── Gemini / Groq API（外部）
│  - 告警引擎            │
│  - 性能聚合            │
└───────────┬───────────┘
            │ REST API（JWT 认证）
            │ GET /api/v1/issues, /performance, /ai, ...
            ▼
┌───────────────────────┐
│ 开发者浏览器           │
│ ┌───────────────────┐ │
│ │@rewind-dev/       │ │
│ │dashboard           │ │
│ └───────────────────┘ │
└───────────────────────┘
```

### 通信协议

| 调用方 | 被调用方 | 协议 | 认证方式 | 说明 |
|--------|----------|------|----------|------|
| SDK → Server | 上报接口 | HTTPS POST | API Key（Header: `X-API-Key`） | 批量事件上报 |
| SDK → Server | SourceMap 上传 | HTTPS POST (multipart) | API Key | CI/CD 中上传 |
| Dashboard → Server | 查询接口 | HTTPS REST | JWT（Header: `Authorization: Bearer`） | 所有数据查询与操作 |
| Server → Gemini/Groq | AI 分析 | HTTPS | API Key | 异步调用，队列处理 |
| Server → Webhook | 告警通知 | HTTPS POST | - | 飞书/钉钉/Slack |

---

## 三、共享类型包（@rewind-dev/shared）

SDK 上报的数据结构需要 SDK 和 Server 双方一致，通过共享类型包保证：

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── event.ts          # 上报事件类型（SDK 构造，Server 消费）
│   │   ├── breadcrumb.ts     # 面包屑类型
│   │   ├── device.ts         # 设备信息类型
│   │   ├── report.ts         # 上报请求体类型
│   │   ├── issue.ts          # Issue 类型（Server 产出，Dashboard 消费）
│   │   ├── ai.ts             # AI 分析结果类型
│   │   ├── performance.ts    # 性能指标类型
│   │   └── alert.ts          # 告警类型
│   └── index.ts
├── tsconfig.json
└── package.json
```

**核心共享类型**：

```typescript
// ---- SDK → Server 的上报数据 ----
export interface ReportPayload {
  appId: string;
  sessionId: string;
  events: SDKEvent[];
  meta: ReportMeta;
}

export interface SDKEvent {
  type: 'error' | 'blank_screen' | 'api_error' | 'performance';
  subType?: string;
  timestamp: number;
  data: Record<string, any>;
  breadcrumbs?: Breadcrumb[];
  requestContext?: RequestRecord[];
}

export interface Breadcrumb {
  type: 'click' | 'route' | 'input' | 'api' | 'visibility' | 'scroll' | 'console' | 'custom';
  message: string;
  data?: Record<string, any>;
  timestamp: number;
  level: 'info' | 'warning' | 'error';
}

export interface RequestRecord {
  url: string;
  method: string;
  status: number;
  duration: number;
  isError: boolean;
  timestamp: number;
}

export interface ReportMeta {
  sdkVersion: string;
  appVersion: string;
  environment: string;
  device: DeviceInfo;
}

export interface DeviceInfo {
  os: string;
  browser: string;
  screen: string;
}

// ---- Server → Dashboard 的数据 ----
export interface IssueVO {
  id: string;
  type: string;
  message: string;
  status: 'open' | 'resolved' | 'ignored' | 'regressed';
  firstSeen: string;
  lastSeen: string;
  eventCount: number;
  userCount: number;
  aiSummary?: string;
}

export interface AIAnalysisResult {
  summary: string;
  contextAnalysis: string;
  possibleCauses: Array<{
    description: string;
    confidence: 'high' | 'medium' | 'low';
    evidence: string;
  }>;
  fixDirection?: {
    description: string;
    steps: string[];
  };
  generatedAt: number;
  modelUsed: string;
}
```

---

## 四、Monorepo 配置（pnpm workspace + Turborepo）

### 4.1 职责划分

| 工具 | 职责 |
|------|------|
| **pnpm workspace** | 包管理基础设施：依赖安装、`workspace:*` 协议、node_modules 管理 |
| **Turborepo** | 构建编排层：任务依赖图、并行执行、构建缓存、增量构建 |

### 4.2 基础配置

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

```json
// 根 package.json
{
  "name": "rewind",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "dev:server": "turbo dev --filter=@rewind-dev/server",
    "dev:dashboard": "turbo dev --filter=@rewind-dev/dashboard",
    "build:sdk": "turbo build --filter=@rewind-dev/sdk"
  },
  "devDependencies": {
    "turbo": "^2.5.0",
    "typescript": "^5.5.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

### 4.3 Turborepo 配置

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "inputs": ["src/**", "tsconfig.json", "package.json"]
    },
    "dev": {
      "dependsOn": ["^build"],
      "persistent": true,
      "cache": false
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

**关键配置说明**：

- `"dependsOn": ["^build"]`：`^` 表示先构建上游依赖。执行 `turbo build` 时，shared 先构建，然后 sdk/server/dashboard 并行构建
- `"outputs": ["dist/**"]`：声明构建产物路径，Turborepo 据此做缓存。第二次构建如果源码没变，直接从缓存恢复 dist，跳过构建
- `"persistent": true`：dev 任务是长驻进程（dev server），不会被 Turbo 视为"已完成"
- `"cache": false`：dev 任务不缓存

### 4.4 构建依赖图

```
turbo build 的执行顺序：

  @rewind-dev/shared ──build──→ ✅
         │
         ├──→ @rewind-dev/sdk ──build──→ ✅
         │         （并行）
         ├──→ @rewind-dev/server ──build──→ ✅
         │         （并行）
         └──→ @rewind-dev/dashboard ──build──→ ✅

第二次执行（源码未变）：
  全部命中缓存 → 0s 完成
```

### 4.5 包间依赖关系

```
@rewind-dev/shared  ← 被以下三个包引用（仅类型，无运行时）
    ↑       ↑       ↑
   sdk    server  dashboard
```

```json
// packages/sdk/package.json 中
{ "dependencies": { "@rewind-dev/shared": "workspace:*" } }

// packages/server/package.json 中
{ "dependencies": { "@rewind-dev/shared": "workspace:*" } }

// packages/dashboard/package.json 中
{ "dependencies": { "@rewind-dev/shared": "workspace:*" } }
```

### 4.6 开发工作流

```bash
# 安装依赖
pnpm install

# 全量构建（首次）
pnpm build                    # turbo build，shared → sdk/server/dashboard 并行

# 开发 server + dashboard（日常开发）
pnpm dev:server               # turbo dev --filter=@rewind-dev/server
pnpm dev:dashboard            # turbo dev --filter=@rewind-dev/dashboard

# 只构建 SDK（修改 SDK 后）
pnpm build:sdk                # turbo build --filter=@rewind-dev/sdk

# 全量 lint / test
pnpm lint                     # turbo lint，并行执行所有包的 lint
pnpm test                     # turbo test，并行执行所有包的 test

# 查看任务依赖图（调试用）
pnpm turbo build --graph      # 生成可视化依赖图
```

---

## 五、需求拆分总览

详细任务清单见各应用设计文档，此处为全局视图：

| 阶段 | SDK 任务 | Server 任务 | Dashboard 任务 | 共享/工程 |
|------|----------|-------------|----------------|-----------|
| **P0-a 采集基础** | 核心引擎、错误捕获、行为录制、上报机制、打包 | 项目初始化、Schema、上报接口、队列消费 | 项目初始化、基础布局 | Monorepo 搭建（pnpm + Turborepo）、shared 类型包 |
| **P0-b 问题定位** | - | 指纹算法、Issue 归并、SourceMap 还原、Issue/Event API | Issue 列表、问题定位工作台（堆栈+时间线+环境+对比） | - |
| **P0-c 白屏与接口** | 白屏检测插件、接口监控插件 | 白屏/接口异常处理 | 类型筛选、工作台适配 | - |
| **P1 AI** | - | LLM Provider、Prompt、上下文构建、摘要/分析/日报 | AI 面板、AI 洞察页 | AI 结果类型定义 |
| **P1 告警** | - | 告警规则、检测引擎、异常检测、通知渠道 | 告警配置页、告警历史 | 告警类型定义 |
| **P2 完善** | 性能采集插件 | 性能聚合、性能 API | 性能页、总览页、设置页、渲染优化 | Docker Compose、文档 |

---

## 六、各应用设计文档索引

| 文档 | 路径 | 内容 |
|------|------|------|
| SDK 设计 | `docs/design/01-SDK设计.md` | 架构、插件系统、各插件实现、上报机制、打包策略 |
| Server 设计 | `docs/design/02-Server设计.md` | NestJS 模块、数据管线、指纹算法、Issue 管理、AI 模块、告警引擎、DB Schema |
| Dashboard 设计 | `docs/design/03-Dashboard设计.md` | 路由、状态管理、API 层、核心组件、页面设计、渲染优化 |
| 本文档 | `docs/design/00-总体架构.md` | 应用间关系、通信协议、共享类型、Monorepo 配置 |
