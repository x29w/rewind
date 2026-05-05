# Rewind — 前端智能監控與問題定位平台

<div align="center">

**讓每個錯誤都有跡可循**

[![English](https://img.shields.io/badge/lang-English-blue.svg)](./README.md)
[![简体中文](https://img.shields.io/badge/lang-简体中文-red.svg)](./README.zh-CN.md)
[![繁體中文](https://img.shields.io/badge/lang-繁體中文-orange.svg)](./README.zh-TW.md)
[![日本語](https://img.shields.io/badge/lang-日本語-green.svg)](./README.ja.md)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRD](https://img.shields.io/badge/PRD-v3.0-green.svg)](docs/PRD/PRD.md)
[![Status](https://img.shields.io/badge/status-in%20development-yellow.svg)]()

</div>

---

## 📖 專案簡介

Rewind 是一個面向前端開發者的智能監控與問題定位平台，核心目標是解決前端線上問題**「複現不了、定位不了」**的痛點。

### 核心特性

- 🎯 **行為錄製與回放** - 自動記錄使用者操作軌跡，錯誤發生時完整還原「錯誤是怎麼發生的」
- 🔍 **問題定位工作台** - 原始碼級堆疊 + 操作時間線 + 環境差異分析 + AI 線索整理
- 🧠 **AI 增強分析** - 自動整理錯誤上下文，給出可能原因和修復方向
- 🎨 **智能歸併去噪** - 錯誤指紋演算法自動歸併同類問題，準確率 > 95%
- 👻 **白屏檢測** - FCP 超時 + DOM 採樣雙重檢測，自動關聯操作軌跡
- 📊 **效能監控** - Web Vitals 採集與分析
- 🚨 **智能告警** - 錯誤激增、Issue 回歸自動通知

### 與傳統監控的區別

```
傳統監控：錯誤發生 → 看到報錯 → 手動排查 → 嘗試複現 → 猜測原因 → 修復
                                  ↑ 耗時最長、最痛苦的環節

Rewind：  錯誤發生 → 自動歸類 → 還原軌跡 → AI 整理線索 → 定位修復
                                  ↑ 核心價值：讓每個錯誤都有跡可循
```

---

## 🏗️ 系統架構

Rewind 採用 **Monorepo** 架構，由 3 個核心應用組成：

```
rewind/
├── packages/
│   ├── shared/          # 共享類型定義
│   ├── sdk/             # 前端採集 SDK (TypeScript + Rollup)
│   ├── server/          # 後端服務 (NestJS + PostgreSQL + Redis)
│   └── dashboard/       # 視覺化平台 (React + Vite + Ant Design)
├── docs/                # 專案文件
├── scripts/             # 工具腳本
└── .kiro/               # Kiro Agent 配置
```

### 技術棧

| 應用 | 技術棧 | 說明 |
|------|--------|------|
| **SDK** | TypeScript + Rollup | 零依賴，gzip < 15KB |
| **Server** | NestJS + Prisma + PostgreSQL + Redis + BullMQ | 模組化架構，支援水平擴展 |
| **Dashboard** | React 18 + Vite + Ant Design 5 + Redux Toolkit + TanStack Router | 類型安全路由，高效能渲染 |

---

## 🚀 快速開始

### 環境要求

- Node.js >= 18
- pnpm >= 9
- PostgreSQL >= 16
- Redis >= 7

### 安裝

```bash
# 克隆專案
git clone https://github.com/your-org/rewind.git
cd rewind

# 安裝依賴
pnpm install

# 全量建置
pnpm build
```

### 開發模式

```bash
# 啟動 Server
pnpm dev:server

# 啟動 Dashboard
pnpm dev:dashboard

# 建置 SDK
pnpm build:sdk
```

### 使用 SDK

```bash
# 安裝
npm install @rewind-dev/sdk

# 或
pnpm add @rewind-dev/sdk
```

```typescript
import { init } from '@rewind-dev/sdk';

init({
  dsn: 'https://your-server.com/api/v1/report',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  environment: 'production',
});
```

---

## 📚 文件

### 核心文件

- [📋 PRD 需求文件](docs/PRD/PRD.md) - 產品定位、功能需求、驗收標準
- [🏛️ 總體架構設計](docs/design/00-总体设计.md) - Monorepo 配置、應用間通訊
- [📦 SDK 設計文件](docs/design/01-SDK设计.md) - 外掛架構、採集機制
- [⚙️ Server 設計文件](docs/design/02-Server设计.md) - 資料管線、指紋演算法、AI 模組
- [🎨 Dashboard 設計文件](docs/design/03-Dashboard设计.md) - 問題定位工作台、路由設計
- [📖 開發規範](docs/development/rules.md) - 程式碼規範、Git 工作流、審查清單

### 多語言文件

所有文件提供簡體中文、繁體中文、英文、日文四種語言版本。詳見 [docs/README.md](docs/README.md)

---

## 🗓️ 開發路線圖

### P0-a：採集基礎（第 1-2 週）✅ 進行中

- [x] 專案文件完成
- [x] 開發規範制定
- [ ] Monorepo 搭建
- [ ] SDK 核心引擎
- [ ] Server 資料接收
- [ ] Dashboard 基礎佈局

### P0-b：問題定位（第 3-5 週）

- [ ] 錯誤指紋歸併
- [ ] SourceMap 還原
- [ ] 問題定位工作台
- [ ] 行為時間線元件
- [ ] 環境差異分析

### P0-c：白屏與介面（第 5-6 週）

- [ ] 白屏檢測外掛
- [ ] 介面監控外掛
- [ ] 介面異常 Issue 類型

### P1：AI 增強（第 7-8 週）

- [ ] LLM Provider 抽象
- [ ] 錯誤摘要（自動）
- [ ] 上下文分析（手動）
- [ ] 修復方向建議

### P1：告警引擎（第 8-9 週）

- [ ] 告警規則引擎
- [ ] 異常檢測
- [ ] 通知管道（Webhook + 郵件）

### P2：完善交付（第 9-10 週）

- [ ] 效能採集與分析
- [ ] AI 日報
- [ ] Dashboard 總覽頁
- [ ] 文件完善

---

## 🤝 貢獻指南

我們歡迎所有形式的貢獻！

### 貢獻方式

- 🐛 提交 Bug 報告
- 💡 提出新功能建議
- 📝 改進文件
- 🔧 提交程式碼修復
- 🌍 幫助翻譯文件

### 開發流程

1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat(scope): add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

詳見 [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📄 授權協議

本專案採用 [MIT License](LICENSE) 開源協議。

---

## 🙏 致謝

感謝所有為 Rewind 專案做出貢獻的開發者！

---

<!-- ## 📧 聯絡方式

- 專案主頁：[GitHub](https://github.com/your-org/rewind)
- 問題回饋：[Issues](https://github.com/your-org/rewind/issues)
- 郵件：dev@rewind.example.com

--- -->

<div align="center">

**Built with ❤️ by Rewind Team**

</div>
