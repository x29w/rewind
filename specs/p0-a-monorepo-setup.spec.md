---
title: P0-a Monorepo 基础搭建
status: pending
priority: high
assignee: agent
estimatedDays: 2
tags: [infrastructure, monorepo, setup]
---

# P0-a Monorepo 基础搭建

## 📋 目标

搭建 Rewind 项目的 Monorepo 基础设施，配置 pnpm workspace + Turborepo，创建三个核心应用的基础结构。

## 🎯 验收标准

- [x] pnpm workspace 配置完成
- [x] Turborepo 配置完成，支持增量构建和缓存
- [x] 三个应用（sdk/server/dashboard）可以独立构建
- [x] shared 包可以被其他包正确引用
- [x] 开发命令可以正常运行（dev:server, dev:dashboard）

## 📦 任务列表

### Task 1: 初始化 Monorepo 结构
**状态**: pending  
**预估**: 0.5 天

- [ ] 创建根目录 package.json
- [ ] 配置 pnpm-workspace.yaml
- [ ] 创建 packages/ 目录结构
- [ ] 配置 .gitignore
- [ ] 配置 .npmrc（pnpm 配置）

**产物**:
```
rewind/
├── package.json
├── pnpm-workspace.yaml
├── .gitignore
├── .npmrc
└── packages/
    ├── shared/
    ├── sdk/
    ├── server/
    └── dashboard/
```

---

### Task 2: 配置 Turborepo
**状态**: pending  
**预估**: 0.5 天

- [ ] 安装 turbo 依赖
- [ ] 创建 turbo.json 配置文件
- [ ] 配置任务依赖关系（build/dev/lint/test）
- [ ] 配置缓存策略
- [ ] 测试增量构建

**配置要点**:
- `build` 任务依赖上游包的 build
- `dev` 任务标记为 persistent
- 配置 outputs 用于缓存

---

### Task 3: 创建 @rewind-dev/shared 包
**状态**: pending  
**预估**: 0.5 天

- [ ] 创建 package.json
- [ ] 配置 TypeScript (tsconfig.json)
- [ ] 创建基础类型定义结构
  - [ ] types/event.ts
  - [ ] types/breadcrumb.ts
  - [ ] types/device.ts
  - [ ] types/issue.ts
- [ ] 配置构建脚本（tsc）
- [ ] 测试类型导出

**关键文件**:
```typescript
// packages/shared/src/types/event.ts
export interface SDKEvent {
  type: 'error' | 'blank_screen' | 'api_error' | 'performance';
  timestamp: number;
  data: Record<string, any>;
}
```

---

### Task 4: 初始化 @rewind-dev/sdk 包
**状态**: pending  
**预估**: 0.5 天

- [ ] 创建 package.json（引用 shared）
- [ ] 配置 TypeScript
- [ ] 配置 Rollup 打包
- [ ] 创建基础目录结构（src/core, src/plugins, src/utils）
- [ ] 创建入口文件 src/index.ts
- [ ] 配置 Vitest 测试环境
- [ ] 测试构建产物（UMD + ESM）

---

### Task 5: 初始化 @rewind-dev/server 包
**状态**: pending  
**预估**: 0.5 天

- [ ] 使用 NestJS CLI 创建项目
- [ ] 配置 package.json（引用 shared）
- [ ] 配置 TypeScript
- [ ] 安装核心依赖（Prisma, Redis, BullMQ）
- [ ] 创建基础模块结构
- [ ] 配置环境变量（.env.example）
- [ ] 测试开发服务器启动

**核心依赖**:
```json
{
  "@nestjs/common": "^11.0.0",
  "@nestjs/core": "^11.0.0",
  "@prisma/client": "^6.0.0",
  "redis": "^4.7.0",
  "bullmq": "^5.0.0"
}
```

---

### Task 6: 初始化 @rewind-dev/dashboard 包
**状态**: pending  
**预估**: 0.5 天

- [ ] 使用 Vite 创建 React 项目
- [ ] 配置 package.json（引用 shared）
- [ ] 配置 TypeScript
- [ ] 安装核心依赖（React, Ant Design, Redux Toolkit, TanStack Router）
- [ ] 创建基础目录结构
- [ ] 配置 TanStack Router
- [ ] 测试开发服务器启动

**核心依赖**:
```json
{
  "react": "^18.3.0",
  "antd": "^5.21.0",
  "@reduxjs/toolkit": "^2.0.0",
  "@tanstack/react-router": "^1.0.0",
  "@tanstack/react-query": "^5.0.0"
}
```

---

### Task 7: 配置根目录脚本
**状态**: pending  
**预估**: 0.5 天

- [ ] 配置 `pnpm dev:server` 命令
- [ ] 配置 `pnpm dev:dashboard` 命令
- [ ] 配置 `pnpm build` 命令（全量构建）
- [ ] 配置 `pnpm build:sdk` 命令
- [ ] 配置 `pnpm lint` 命令
- [ ] 配置 `pnpm test` 命令
- [ ] 配置 `pnpm type-check` 命令
- [ ] 测试所有命令

**根 package.json scripts**:
```json
{
  "scripts": {
    "dev:server": "turbo dev --filter=@rewind-dev/server",
    "dev:dashboard": "turbo dev --filter=@rewind-dev/dashboard",
    "build": "turbo build",
    "build:sdk": "turbo build --filter=@rewind-dev/sdk",
    "lint": "turbo lint",
    "test": "turbo test",
    "type-check": "turbo type-check"
  }
}
```

---

## 🔍 验证步骤

完成所有任务后，执行以下验证：

```bash
# 1. 安装依赖
pnpm install

# 2. 全量构建
pnpm build
# 预期：shared → sdk/server/dashboard 依次构建成功

# 3. 再次构建（测试缓存）
pnpm build
# 预期：所有包命中缓存，0s 完成

# 4. 启动 server
pnpm dev:server
# 预期：NestJS 服务启动在 3000 端口

# 5. 启动 dashboard
pnpm dev:dashboard
# 预期：Vite 开发服务器启动在 5173 端口

# 6. 构建 SDK
pnpm build:sdk
# 预期：生成 dist/rewind.umd.js 和 dist/rewind.esm.js
```

---

## 📝 注意事项

1. **版本统一**: 所有包的 TypeScript 版本保持一致（5.5.x）
2. **Node 版本**: 确保使用 Node.js >= 18
3. **pnpm 版本**: 使用 pnpm >= 9.15.0
4. **workspace 协议**: 包间引用使用 `workspace:*`
5. **构建顺序**: shared 必须先于其他包构建

---

## 🔗 相关文档

- [总体架构设计](../docs/design/00-总体设计.md)
- [开发规范](../docs/development/rules.md)
