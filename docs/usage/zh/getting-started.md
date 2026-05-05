# Rewind 使用指南

## 概述

Rewind 是一个智能前端监控平台，由三个核心组件组成：

1. **SDK** - 前端数据收集库，集成到您的应用中
2. **Server** - 后端服务，处理数据存储、分析和 AI 功能
3. **Dashboard** - 可视化平台，用于查看和管理监控数据

## 整体实现流程

```
用户应用 → SDK 收集 → Server 处理 → Dashboard 展示
    ↓           ↓          ↓           ↓
  集成SDK    自动上报    智能分析    问题定位
```

### 详细流程

1. **数据收集阶段**
   - SDK 自动捕获错误、用户行为、性能数据
   - 实时记录面包屑轨迹（点击、导航、API 调用等）
   - 检测白屏、API 异常等特殊场景

2. **数据处理阶段**
   - Server 接收 SDK 上报的数据
   - 使用指纹算法自动聚合相似问题
   - AI 分析错误原因并提供修复建议
   - 触发智能告警规则

3. **问题定位阶段**
   - Dashboard 展示问题列表和详情
   - 提供完整的用户操作轨迹回放
   - 显示错误堆栈、环境信息、AI 分析结果
   - 支持问题状态管理和团队协作

---

## 一、快速开始

### 1.1 部署 Rewind 平台

#### 使用 Docker（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/your-org/rewind.git
cd rewind

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置数据库密码、JWT 密钥等

# 3. 启动所有服务
docker-compose up -d

# 4. 访问 Dashboard
# http://localhost - Dashboard 界面
# http://localhost:3000 - Server API
# http://localhost:3000/api-docs - API 文档
```

详细部署说明请参考：[部署指南](../deployment/zh/deployment.md)

### 1.2 创建项目

1. 访问 Dashboard：http://localhost
2. 注册账号并登录
3. 创建新项目，获取 **App ID** 和 **API Key**

---

## 二、SDK 集成使用

### 2.1 安装 SDK

```bash
# npm
npm install @rewind-dev/sdk

# pnpm
pnpm add @rewind-dev/sdk

# yarn
yarn add @rewind-dev/sdk
```

### 2.2 基础集成

#### 2.2.1 最简集成

```typescript
import { init } from '@rewind-dev/sdk';

// 在应用启动时初始化
init({
  dsn: 'http://localhost:3000/api/v1/report',  // Server 地址
  appId: 'your-app-id',                        // 从 Dashboard 获取
  appVersion: '1.0.0',                         // 应用版本
  environment: 'production',                   // 环境标识
});
```

#### 2.2.2 完整配置

```typescript
import { init } from '@rewind-dev/sdk';

const client = init({
  // 必需配置
  dsn: 'http://localhost:3000/api/v1/report',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  
  // 可选配置
  environment: 'production',           // 环境：development, staging, production
  sampleRate: 1.0,                    // 采样率：0.0-1.0，1.0 表示 100% 采样
  maxBreadcrumbs: 100,                // 面包屑最大数量
  enabled: true,                      // 是否启用 SDK
  debug: false,                       // 调试模式
  
  // 用户信息
  user: {
    id: 'user-123',
    email: 'user@example.com',
    username: 'john_doe'
  },
  
  // 自定义标签
  tags: {
    team: 'frontend',
    feature: 'checkout'
  },
  
  // 插件配置
  enableBlankScreenDetection: true,   // 启用白屏检测
  enableApiMonitoring: true,          // 启用 API 监控
});
```

### 2.3 手动上报

#### 2.3.1 捕获错误

```typescript
import { getClient } from '@rewind-dev/sdk';

const client = getClient();

try {
  // 可能出错的代码
  riskyOperation();
} catch (error) {
  // 手动上报错误
  client?.captureError(error, {
    extra: {
      userId: '123',
      action: 'checkout',
      step: 'payment'
    }
  });
}
```

#### 2.3.2 添加面包屑

```typescript
import { getClient } from '@rewind-dev/sdk';

const client = getClient();

// 添加自定义面包屑
client?.addBreadcrumb({
  type: 'user',
  message: '用户点击了购买按钮',
  timestamp: Date.now(),
  level: 'info',
  category: 'ui',
  data: {
    buttonId: 'buy-now',
    productId: 'prod-123'
  }
});
```

#### 2.3.3 发送自定义事件

```typescript
import { getClient } from '@rewind-dev/sdk';

const client = getClient();

// 发送业务事件
client?.sendEvent({
  type: 'business',
  message: '用户完成购买',
  timestamp: Date.now(),
  level: 'info',
  extra: {
    orderId: 'order-456',
    amount: 99.99,
    currency: 'USD'
  }
});
```

### 2.4 框架集成示例

#### 2.4.1 React 集成

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

// 初始化监控
initMonitoring();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
```

#### 2.4.2 Vue 集成

```typescript
// src/plugins/monitoring.ts
import { init } from '@rewind-dev/sdk';
import type { App } from 'vue';

export default {
  install(app: App) {
    const client = init({
      dsn: import.meta.env.VITE_REWIND_DSN,
      appId: import.meta.env.VITE_REWIND_APP_ID,
      appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.MODE,
    });
    
    // 全局错误处理
    app.config.errorHandler = (error, instance, info) => {
      client?.captureError(error as Error, {
        extra: { info, component: instance?.$options.name }
      });
    };
    
    app.provide('rewindClient', client);
  }
};

// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import monitoring from './plugins/monitoring';

const app = createApp(App);
app.use(monitoring);
app.mount('#app');
```

### 2.5 高级功能

#### 2.5.1 自定义插件

```typescript
import { init, type SDK } from '@rewind-dev/sdk';

// 创建自定义插件
class CustomPlugin implements SDK.Plugin {
  name = 'custom-plugin';
  
  setup(client: SDK.Client) {
    // 监听特定事件
    window.addEventListener('custom-event', (event) => {
      client.addBreadcrumb({
        type: 'custom',
        message: '自定义事件触发',
        timestamp: Date.now(),
        data: event.detail
      });
    });
  }
  
  teardown() {
    // 清理资源
  }
}

// 注册插件
const client = init({
  dsn: 'your-dsn',
  appId: 'your-app-id',
  appVersion: '1.0.0'
});

client.registerPlugin(new CustomPlugin());
```

#### 2.5.2 条件采样

```typescript
import { init } from '@rewind-dev/sdk';

init({
  dsn: 'your-dsn',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  
  // 根据用户类型设置不同采样率
  sampleRate: (() => {
    const userType = localStorage.getItem('userType');
    switch (userType) {
      case 'vip': return 1.0;      // VIP 用户 100% 采样
      case 'premium': return 0.5;  // 付费用户 50% 采样
      default: return 0.1;         // 普通用户 10% 采样
    }
  })(),
});
```

---

## 三、Dashboard 使用

### 3.1 项目管理

#### 3.1.1 创建项目

1. 登录 Dashboard
2. 点击"新建项目"
3. 填写项目信息：
   - 项目名称
   - 项目描述
   - 团队成员
4. 获取 App ID 和 API Key

#### 3.1.2 项目配置

- **基础设置**：项目名称、描述、团队成员
- **告警规则**：错误数量阈值、通知渠道
- **数据保留**：历史数据保留时间
- **API 密钥**：管理 SDK 接入密钥

### 3.2 问题管理

#### 3.2.1 问题列表

- **筛选功能**：按状态、级别、时间范围筛选
- **搜索功能**：按错误信息、文件名搜索
- **排序功能**：按发生时间、影响用户数排序
- **批量操作**：批量标记已解决、忽略

#### 3.2.2 问题详情

**基础信息**
- 错误消息和堆栈信息
- 发生时间和影响用户数
- 错误级别和状态

**用户轨迹**
- 完整的用户操作时间线
- 点击、导航、API 调用记录
- 错误发生前的关键操作

**环境信息**
- 浏览器、操作系统信息
- 屏幕分辨率、设备类型
- 网络状态、页面 URL

**AI 分析**
- 错误根因分析
- 可能的修复建议
- 相似问题推荐

### 3.3 监控大屏

#### 3.3.1 实时监控

- **错误趋势图**：24小时错误数量变化
- **用户影响**：受影响用户数统计
- **性能指标**：页面加载时间、API 响应时间
- **白屏检测**：白屏事件实时监控

#### 3.3.2 API 监控

- **API 调用统计**：成功率、响应时间
- **错误分布**：按状态码分类统计
- **慢查询**：响应时间超过阈值的请求
- **异常接口**：错误率异常的 API 端点

### 3.4 告警配置

#### 3.4.1 告警规则

```typescript
// 示例：配置错误数量告警
{
  name: '错误数量告警',
  condition: {
    metric: 'error_count',
    operator: 'greater_than',
    threshold: 10,
    timeWindow: '5m'  // 5分钟内
  },
  channels: ['email', 'webhook'],
  enabled: true
}
```

#### 3.4.2 通知渠道

- **邮件通知**：支持多个收件人
- **Webhook**：自定义 HTTP 回调
- **微信群机器人**：企业微信群通知
- **钉钉机器人**：钉钉群通知

---

## 四、Server API 使用

### 4.1 认证

所有 API 请求需要在 Header 中包含 API Key：

```http
POST /api/v1/report
Content-Type: application/json
X-API-Key: your-api-key

{
  "event": { ... }
}
```

### 4.2 事件上报 API

#### 4.2.1 单个事件上报

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
    "breadcrumbs": [
      {
        "type": "navigation",
        "message": "用户访问了 /checkout 页面",
        "timestamp": 1683359990000,
        "level": "info",
        "category": "navigation",
        "data": {
          "from": "/cart",
          "to": "/checkout"
        }
      }
    ],
    "deviceInfo": {
      "userAgent": "Mozilla/5.0...",
      "browser": "Chrome",
      "browserVersion": "113.0.0",
      "os": "Windows",
      "osVersion": "10",
      "deviceType": "desktop",
      "screenWidth": 1920,
      "screenHeight": 1080,
      "viewportWidth": 1200,
      "viewportHeight": 800,
      "language": "zh-CN",
      "timezone": "Asia/Shanghai"
    }
  }
}
```

#### 4.2.2 批量事件上报

```http
POST /api/v1/report/batch
Content-Type: application/json
X-API-Key: your-api-key

{
  "events": [
    { "type": "error", ... },
    { "type": "behavior", ... },
    { "type": "performance", ... }
  ]
}
```

### 4.3 查询 API

#### 4.3.1 获取问题列表

```http
GET /api/v1/issues?page=1&pageSize=20&status=open&level=high
Authorization: Bearer jwt-token
```

#### 4.3.2 获取问题详情

```http
GET /api/v1/issues/:issueId
Authorization: Bearer jwt-token
```

#### 4.3.3 AI 分析

```http
POST /api/v1/ai/analyze
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "issueId": "issue-123"
}
```

---

## 五、最佳实践

### 5.1 SDK 集成最佳实践

#### 5.1.1 错误边界

```typescript
// React 错误边界示例
import React from 'react';
import { getClient } from '@rewind-dev/sdk';

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const client = getClient();
    client?.captureError(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });
  }
  
  render() {
    // 错误 UI 渲染逻辑
  }
}
```

#### 5.1.2 异步错误捕获

```typescript
// Promise 错误捕获
window.addEventListener('unhandledrejection', (event) => {
  const client = getClient();
  client?.captureError(new Error(event.reason), {
    extra: {
      type: 'unhandledrejection',
      promise: true
    }
  });
});
```

#### 5.1.3 性能监控

```typescript
import { getClient } from '@rewind-dev/sdk';

// 监控页面加载性能
window.addEventListener('load', () => {
  const client = getClient();
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  client?.sendEvent({
    type: 'performance',
    message: '页面加载完成',
    timestamp: Date.now(),
    extra: {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime
    }
  });
});
```

### 5.2 数据质量优化

#### 5.2.1 有意义的错误信息

```typescript
// ❌ 不好的错误信息
throw new Error('Something went wrong');

// ✅ 好的错误信息
throw new Error(`Failed to load user profile: ${userId}, status: ${response.status}`);
```

#### 5.2.2 结构化的额外数据

```typescript
// ✅ 结构化的 extra 数据
client?.captureError(error, {
  extra: {
    user: {
      id: userId,
      role: userRole
    },
    request: {
      url: requestUrl,
      method: 'POST',
      body: requestBody
    },
    context: {
      page: currentPage,
      feature: 'checkout',
      step: 'payment'
    }
  }
});
```

#### 5.2.3 敏感信息过滤

```typescript
// 配置敏感信息过滤
init({
  dsn: 'your-dsn',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  
  // 自定义数据处理
  beforeSend: (event) => {
    // 过滤敏感信息
    if (event.extra?.password) {
      delete event.extra.password;
    }
    if (event.extra?.creditCard) {
      event.extra.creditCard = '****';
    }
    return event;
  }
});
```

### 5.3 性能优化

#### 5.3.1 采样策略

```typescript
// 根据环境和用户类型设置采样率
const getSampleRate = () => {
  if (process.env.NODE_ENV === 'development') {
    return 1.0;  // 开发环境 100% 采样
  }
  
  const userType = getUserType();
  switch (userType) {
    case 'internal': return 1.0;    // 内部用户 100%
    case 'beta': return 0.5;        // Beta 用户 50%
    case 'premium': return 0.2;     // 付费用户 20%
    default: return 0.05;           // 普通用户 5%
  }
};

init({
  dsn: 'your-dsn',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  sampleRate: getSampleRate()
});
```

#### 5.3.2 批量上报

```typescript
// SDK 会自动批量上报，也可以手动控制
init({
  dsn: 'your-dsn',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  
  // 批量上报配置
  transport: {
    batchSize: 10,        // 批量大小
    flushInterval: 5000,  // 刷新间隔（毫秒）
    maxRetries: 3         // 最大重试次数
  }
});
```

---

## 六、故障排查

### 6.1 SDK 问题

#### 6.1.1 SDK 未上报数据

**检查清单：**

1. 确认 DSN 地址正确
2. 确认 App ID 和 API Key 正确
3. 检查网络连接和 CORS 配置
4. 确认采样率不为 0
5. 检查浏览器控制台是否有错误

**调试方法：**

```typescript
// 启用调试模式
init({
  dsn: 'your-dsn',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  debug: true  // 启用调试日志
});
```

#### 6.1.2 数据上报不完整

**可能原因：**

1. 网络问题导致请求失败
2. 服务器返回错误状态码
3. 数据格式不正确

**解决方法：**

```typescript
// 监听上报状态
init({
  dsn: 'your-dsn',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  
  // 上报回调
  onSuccess: (event) => {
    console.log('上报成功:', event);
  },
  onError: (error, event) => {
    console.error('上报失败:', error, event);
  }
});
```

### 6.2 Server 问题

#### 6.2.1 API 响应慢

**排查步骤：**

1. 检查数据库连接和查询性能
2. 检查 Redis 缓存是否正常
3. 查看服务器资源使用情况
4. 检查网络延迟

**优化方法：**

```bash
# 查看数据库慢查询
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

# 检查 Redis 性能
redis-cli --latency-history

# 监控服务器资源
htop
iostat -x 1
```

#### 6.2.2 数据库连接问题

**常见错误：**

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解决方法：**

1. 确认 PostgreSQL 服务运行正常
2. 检查连接字符串配置
3. 确认防火墙设置
4. 检查数据库用户权限

### 6.3 Dashboard 问题

#### 6.3.1 页面加载慢

**优化方法：**

1. 启用 CDN 加速
2. 配置 Nginx 压缩
3. 优化图片资源
4. 使用浏览器缓存

#### 6.3.2 数据不显示

**排查步骤：**

1. 检查 API 请求是否成功
2. 确认用户权限配置
3. 检查时间范围筛选
4. 查看浏览器控制台错误

---

## 七、常见问题 FAQ

### Q1: SDK 会影响应用性能吗？

**A:** SDK 经过精心优化，对应用性能影响极小：
- 核心包 gzip 后 < 15KB
- 异步上报，不阻塞主线程
- 智能采样，减少网络请求
- 内置错误处理，不会导致应用崩溃

### Q2: 如何处理敏感数据？

**A:** 多种方式保护敏感数据：
- 使用 `beforeSend` 回调过滤敏感字段
- 配置采样率，减少数据收集
- 设置数据保留期限，定期清理
- 支持本地部署，数据不出内网

### Q3: 支持哪些浏览器？

**A:** SDK 支持所有现代浏览器：
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- 移动端浏览器

### Q4: 如何扩展 SDK 功能？

**A:** 通过插件系统扩展：
- 实现 `Plugin` 接口
- 使用 `client.registerPlugin()` 注册
- 监听 DOM 事件、API 调用等
- 自定义数据收集逻辑

### Q5: 数据存储多长时间？

**A:** 可配置数据保留策略：
- 默认保留 30 天
- 支持 7 天到 1 年的配置
- 自动清理过期数据
- 支持手动导出重要数据

---

## 八、技术支持

### 8.1 文档资源

- **API 文档**: http://localhost:3000/api-docs
- **部署指南**: [docs/deployment/](../deployment/)
- **开发规范**: [docs/development/](../development/)
- **设计文档**: [docs/design/](../design/)

### 8.2 社区支持

- **GitHub Issues**: https://github.com/your-org/rewind/issues
- **讨论区**: https://github.com/your-org/rewind/discussions
- **更新日志**: https://github.com/your-org/rewind/releases

### 8.3 商业支持

- **技术咨询**: support@rewind.dev
- **定制开发**: enterprise@rewind.dev
- **培训服务**: training@rewind.dev

---

**最后更新**: 2026-05-05
**文档版本**: v1.0