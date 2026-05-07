# Rewind — 前端智能监控与问题定位平台

<div align="center">

**让每个错误都有迹可循**

[![English](https://img.shields.io/badge/lang-English-blue.svg)](./README.md)
[![简体中文](https://img.shields.io/badge/lang-简体中文-red.svg)](./README.zh-CN.md)
[![繁體中文](https://img.shields.io/badge/lang-繁體中文-orange.svg)](./README.zh-TW.md)
[![日本語](https://img.shields.io/badge/lang-日本語-green.svg)](./README.ja.md)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRD](https://img.shields.io/badge/PRD-v3.0-green.svg)](docs/PRD/PRD.md)
[![Status](https://img.shields.io/badge/status-in%20development-yellow.svg)]()

</div>

---

## 📖 项目简介

Rewind 是一个面向前端开发者的智能监控与问题定位平台，核心目标是解决前端线上问题**"复现不了、定位不了"**的痛点。

### 核心特性

- 🎯 **行为录制与回放** - 自动记录用户操作轨迹，错误发生时完整还原"错误是怎么发生的"
- 🔍 **问题定位工作台** - 源码级堆栈 + 操作时间线 + 环境差异分析 + AI 线索整理
- 🧠 **AI 增强分析** - 自动整理错误上下文，给出可能原因和修复方向
- 🎨 **智能归并去噪** - 错误指纹算法自动归并同类问题，准确率 > 95%
- 👻 **白屏检测** - FCP 超时 + DOM 采样双重检测，自动关联操作轨迹
- 📊 **性能监控** - Web Vitals 采集与分析
- 🚨 **智能告警** - 错误激增、Issue 回归自动通知

### 与传统监控的区别

```
传统监控：错误发生 → 看到报错 → 手动排查 → 尝试复现 → 猜测原因 → 修复
                                  ↑ 耗时最长、最痛苦的环节

Rewind：  错误发生 → 自动归类 → 还原轨迹 → AI 整理线索 → 定位修复
                                  ↑ 核心价值：让每个错误都有迹可循
```

---

## 🏗️ 系统架构

Rewind 采用 **Monorepo** 架构，由 3 个核心应用组成：

```
rewind/
├── packages/
│   ├── shared/          # 共享类型定义
│   ├── sdk/             # 前端采集 SDK (TypeScript + Rollup)
│   ├── server/          # 后端服务 (NestJS + PostgreSQL + Redis)
│   └── dashboard/       # 可视化平台 (React + Vite + Ant Design)
├── docs/                # 项目文档
├── scripts/             # 工具脚本
└── .kiro/               # Kiro Agent 配置
```

### 技术栈

| 应用          | 技术栈                                                           | 说明                     |
| ------------- | ---------------------------------------------------------------- | ------------------------ |
| **SDK**       | TypeScript + Rollup                                              | 零依赖，gzip < 15KB      |
| **Server**    | NestJS + Prisma + PostgreSQL + Redis + BullMQ                    | 模块化架构，支持水平扩展 |
| **Dashboard** | React 18 + Vite + Ant Design 5 + Redux Toolkit + TanStack Router | 类型安全路由，高性能渲染 |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 9
- PostgreSQL >= 16
- Redis >= 7

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/X29w/rewind.git
cd rewind

# 安装依赖
pnpm install

# 全量构建
pnpm build
```

### 开发模式

```bash
# 启动 Server
pnpm dev:server

# 启动 Dashboard
pnpm dev:dashboard

# 构建 SDK
pnpm build:sdk
```

### 使用 SDK

```bash
# 安装
npm install @rewind-dev/sdk

# 或
pnpm add @rewind-dev/sdk
```

```typescript
import { init } from "@rewind-dev/sdk";

init({
  dsn: "https://your-server.com/api/v1/report",
  appId: "your-app-id",
  appVersion: "1.0.0",
  environment: "production",
});
```

---

## 📚 文档

### 核心文档

- [📋 PRD 需求文档](docs/PRD/PRD.md) - 产品定位、功能需求、验收标准
- [🏛️ 总体架构设计](docs/design/00-总体设计.md) - Monorepo 配置、应用间通信
- [📦 SDK 设计文档](docs/design/01-SDK设计.md) - 插件化架构、采集机制
- [⚙️ Server 设计文档](docs/design/02-Server设计.md) - 数据管线、指纹算法、AI 模块
- [🎨 Dashboard 设计文档](docs/design/03-Dashboard设计.md) - 问题定位工作台、路由设计
- [📖 开发规范](docs/development/rules.md) - 代码规范、Git 工作流、审查清单

### 多语言文档

所有文档提供简体中文、繁体中文、英文、日文四种语言版本。详见 [docs/README.md](docs/README.md)

---

## 🗓️ 开发路线图

### P0-a：采集基础（第 1-2 周）✅ 进行中

- [x] 项目文档完成
- [x] 开发规范制定
- [ ] Monorepo 搭建
- [ ] SDK 核心引擎
- [ ] Server 数据接收
- [ ] Dashboard 基础布局

### P0-b：问题定位（第 3-5 周）

- [ ] 错误指纹归并
- [ ] SourceMap 还原
- [ ] 问题定位工作台
- [ ] 行为时间线组件
- [ ] 环境差异分析

### P0-c：白屏与接口（第 5-6 周）

- [ ] 白屏检测插件
- [ ] 接口监控插件
- [ ] 接口异常 Issue 类型

### P1：AI 增强（第 7-8 周）

- [ ] LLM Provider 抽象
- [ ] 错误摘要（自动）
- [ ] 上下文分析（手动）
- [ ] 修复方向建议

### P1：告警引擎（第 8-9 周）

- [ ] 告警规则引擎
- [ ] 异常检测
- [ ] 通知渠道（Webhook + 邮件）

### P2：完善交付（第 9-10 周）

- [ ] 性能采集与分析
- [ ] AI 日报
- [ ] Dashboard 总览页
- [ ] 文档完善

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式

- 🐛 提交 Bug 报告
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- 🌍 帮助翻译文档

### 开发流程

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat(scope): add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

详见 [开发规范](docs/development/rules.md)

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 🙏 致谢

感谢所有为 Rewind 项目做出贡献的开发者！

---

<!-- ## 📧 联系方式

- 项目主页：[GitHub](https://github.com/X29w/rewind)
- 问题反馈：[Issues](https://github.com/X29w/rewind/issues)
- 邮件：dev@rewind.example.com

--- -->

<div align="center">

**Built with ❤️ by Rewind Team**

</div>
