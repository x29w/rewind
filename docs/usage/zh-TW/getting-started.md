# Rewind 使用指南

## 概述

Rewind 是一個智慧前端監控平台，由三個核心組件組成：

1. **SDK** - 前端資料收集庫，整合到您的應用程式中
2. **Server** - 後端服務，處理資料儲存、分析和 AI 功能
3. **Dashboard** - 視覺化平台，用於檢視和管理監控資料

## 整體實現流程

```
使用者應用 → SDK 收集 → Server 處理 → Dashboard 展示
    ↓           ↓          ↓           ↓
  整合SDK    自動上報    智慧分析    問題定位
```

### 詳細流程

1. **資料收集階段**
   - SDK 自動捕獲錯誤、使用者行為、效能資料
   - 即時記錄麵包屑軌跡（點擊、導航、API 呼叫等）
   - 檢測白屏、API 異常等特殊場景

2. **資料處理階段**
   - Server 接收 SDK 上報的資料
   - 使用指紋演算法自動聚合相似問題
   - AI 分析錯誤原因並提供修復建議
   - 觸發智慧告警規則

3. **問題定位階段**
   - Dashboard 展示問題清單和詳情
   - 提供完整的使用者操作軌跡回放
   - 顯示錯誤堆疊、環境資訊、AI 分析結果
   - 支援問題狀態管理和團隊協作

---

## 一、快速開始

### 1.1 部署 Rewind 平台

#### 使用 Docker（推薦）

```bash
# 1. 複製專案
git clone https://github.com/X29w/rewind.git
cd rewind

# 2. 設定環境變數
cp .env.example .env
# 編輯 .env 檔案，設定資料庫密碼、JWT 金鑰等

# 3. 啟動所有服務
docker-compose up -d

# 4. 存取 Dashboard
# http://localhost - Dashboard 介面
# http://localhost:3000 - Server API
# http://localhost:3000/api-docs - API 文件
```

詳細部署說明請參考：[部署指南](../deployment/zh-TW/deployment.md)

### 1.2 建立專案

1. 存取 Dashboard：http://localhost
2. 註冊帳號並登入
3. 建立新專案，取得 **App ID** 和 **API Key**

---

## 二、SDK 整合使用

### 2.1 安裝 SDK

```bash
# npm
npm install @rewind-dev/sdk

# pnpm
pnpm add @rewind-dev/sdk

# yarn
yarn add @rewind-dev/sdk
```

### 2.2 基礎整合

#### 2.2.1 最簡整合

```typescript
import { init } from "@rewind-dev/sdk";

// 在應用程式啟動時初始化
init({
  dsn: "http://localhost:3000/api/v1/report", // Server 位址
  appId: "your-app-id", // 從 Dashboard 取得
  appVersion: "1.0.0", // 應用程式版本
  environment: "production", // 環境識別
});
```

#### 2.2.2 完整設定

```typescript
import { init } from "@rewind-dev/sdk";

const client = init({
  // 必需設定
  dsn: "http://localhost:3000/api/v1/report",
  appId: "your-app-id",
  appVersion: "1.0.0",

  // 可選設定
  environment: "production", // 環境：development, staging, production
  sampleRate: 1.0, // 取樣率：0.0-1.0，1.0 表示 100% 取樣
  maxBreadcrumbs: 100, // 麵包屑最大數量
  enabled: true, // 是否啟用 SDK
  debug: false, // 除錯模式

  // 使用者資訊
  user: {
    id: "user-123",
    email: "user@example.com",
    username: "john_doe",
  },

  // 自訂標籤
  tags: {
    team: "frontend",
    feature: "checkout",
  },

  // 外掛設定
  enableBlankScreenDetection: true, // 啟用白屏檢測
  enableApiMonitoring: true, // 啟用 API 監控
});
```

### 2.3 手動上報

#### 2.3.1 捕獲錯誤

```typescript
import { getClient } from "@rewind-dev/sdk";

const client = getClient();

try {
  // 可能出錯的程式碼
  riskyOperation();
} catch (error) {
  // 手動上報錯誤
  client?.captureError(error, {
    extra: {
      userId: "123",
      action: "checkout",
      step: "payment",
    },
  });
}
```

#### 2.3.2 新增麵包屑

```typescript
import { getClient } from "@rewind-dev/sdk";

const client = getClient();

// 新增自訂麵包屑
client?.addBreadcrumb({
  type: "user",
  message: "使用者點擊了購買按鈕",
  timestamp: Date.now(),
  level: "info",
  category: "ui",
  data: {
    buttonId: "buy-now",
    productId: "prod-123",
  },
});
```

### 2.4 框架整合範例

#### 2.4.1 React 整合

```typescript
// src/utils/monitoring.ts
import { init } from '@rewind-dev/sdk';

export const initMonitoring = () => {
  return init({
    dsn: process.env.REACT_APP_REWIND_DSN!,
    appId: process.env.REACT_APP_REWIND_APP_ID!,
    appVersion: process.env.REACT_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV,
    user: {
      id: localStorage.getItem('userId') || undefined,
    }
  });
};

// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initMonitoring } from './utils/monitoring';

// 初始化監控
initMonitoring();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
```

#### 2.4.2 Vue 整合

```typescript
// src/plugins/monitoring.ts
import { init } from "@rewind-dev/sdk";
import type { App } from "vue";

export default {
  install(app: App) {
    const client = init({
      dsn: import.meta.env.VITE_REWIND_DSN,
      appId: import.meta.env.VITE_REWIND_APP_ID,
      appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
      environment: import.meta.env.MODE,
    });

    // 全域錯誤處理
    app.config.errorHandler = (error, instance, info) => {
      client?.captureError(error as Error, {
        extra: { info, component: instance?.$options.name },
      });
    };

    app.provide("rewindClient", client);
  },
};

// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";
import monitoring from "./plugins/monitoring";

const app = createApp(App);
app.use(monitoring);
app.mount("#app");
```

---

## 三、Dashboard 使用

### 3.1 專案管理

#### 3.1.1 建立專案

1. 登入 Dashboard
2. 點擊「新建專案」
3. 填寫專案資訊：
   - 專案名稱
   - 專案描述
   - 團隊成員
4. 取得 App ID 和 API Key

#### 3.1.2 專案設定

- **基礎設定**：專案名稱、描述、團隊成員
- **告警規則**：錯誤數量閾值、通知管道
- **資料保留**：歷史資料保留時間
- **API 金鑰**：管理 SDK 接入金鑰

### 3.2 問題管理

#### 3.2.1 問題清單

- **篩選功能**：按狀態、級別、時間範圍篩選
- **搜尋功能**：按錯誤訊息、檔案名搜尋
- **排序功能**：按發生時間、影響使用者數排序
- **批次操作**：批次標記已解決、忽略

#### 3.2.2 問題詳情

**基礎資訊**

- 錯誤訊息和堆疊資訊
- 發生時間和影響使用者數
- 錯誤級別和狀態

**使用者軌跡**

- 完整的使用者操作時間線
- 點擊、導航、API 呼叫記錄
- 錯誤發生前的關鍵操作

**環境資訊**

- 瀏覽器、作業系統資訊
- 螢幕解析度、裝置類型
- 網路狀態、頁面 URL

**AI 分析**

- 錯誤根因分析
- 可能的修復建議
- 相似問題推薦

---

## 四、Server API 使用

### 4.1 認證

所有 API 請求需要在 Header 中包含 API Key：

```http
POST /api/v1/report
Content-Type: application/json
X-API-Key: your-api-key

{
  "event": { ... }
}
```

### 4.2 事件上報 API

#### 4.2.1 單個事件上報

```http
POST /api/v1/report
Content-Type: application/json
X-API-Key: your-api-key

{
  "event": {
    "type": "error",
    "message": "TypeError: Cannot read property 'name' of undefined",
    "timestamp": 1683360000000,
    "stack": "TypeError: Cannot read property...",
    "filename": "https://example.com/app.js",
    "lineno": 42,
    "colno": 15,
    "extra": {
      "userId": "user-123",
      "action": "checkout"
    },
    "tags": {
      "environment": "production",
      "version": "1.0.0"
    },
    "breadcrumbs": [...],
    "deviceInfo": {...}
  }
}
```

---

## 五、最佳實踐

### 5.1 SDK 整合最佳實踐

#### 5.1.1 錯誤邊界

```typescript
// React 錯誤邊界範例
import React from "react";
import { getClient } from "@rewind-dev/sdk";

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const client = getClient();
    client?.captureError(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    });
  }

  render() {
    // 錯誤 UI 渲染邏輯
  }
}
```

### 5.2 效能最佳化

#### 5.2.1 取樣策略

```typescript
// 根據環境和使用者類型設定取樣率
const getSampleRate = () => {
  if (process.env.NODE_ENV === "development") {
    return 1.0; // 開發環境 100% 取樣
  }

  const userType = getUserType();
  switch (userType) {
    case "internal":
      return 1.0; // 內部使用者 100%
    case "beta":
      return 0.5; // Beta 使用者 50%
    case "premium":
      return 0.2; // 付費使用者 20%
    default:
      return 0.05; // 普通使用者 5%
  }
};

init({
  dsn: "your-dsn",
  appId: "your-app-id",
  appVersion: "1.0.0",
  sampleRate: getSampleRate(),
});
```

---

## 六、常見問題 FAQ

### Q1: SDK 會影響應用程式效能嗎？

**A:** SDK 經過精心最佳化，對應用程式效能影響極小：

- 核心套件 < 15KB gzip 壓縮
- 非同步上報，不阻塞主執行緒
- 智慧取樣，減少網路請求
- 內建錯誤處理，不會導致應用程式崩潰

### Q2: 如何處理敏感資料？

**A:** 多種方式保護敏感資料：

- 使用 `beforeSend` 回呼過濾敏感欄位
- 設定取樣率，減少資料收集
- 設定資料保留期限，定期清理
- 支援本地部署，資料不出內網

### Q3: 支援哪些瀏覽器？

**A:** SDK 支援所有現代瀏覽器：

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- 行動裝置瀏覽器

---

## 七、技術支援

### 7.1 文件資源

- **API 文件**: http://localhost:3000/api-docs
- **部署指南**: [docs/deployment/](../deployment/)
- **開發規範**: [docs/development/](../development/)
- **設計文件**: [docs/design/](../design/)

### 7.2 社群支援

- **GitHub Issues**: https://github.com/X29w/rewind/issues
- **討論區**: https://github.com/X29w/rewind/discussions
- **更新日誌**: https://github.com/X29w/rewind/releases

### 7.3 商業支援

- **技術諮詢**: support@rewind.dev
- **客製開發**: enterprise@rewind.dev
- **培訓服務**: training@rewind.dev

---

**最後更新**: 2026-05-05
**文件版本**: v1.0
