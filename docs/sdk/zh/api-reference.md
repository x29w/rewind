# Rewind SDK API 参考文档

## 概述

本文档详细介绍了 Rewind SDK 的所有公开 API 方法、配置选项和类型定义。

## 目录

- [初始化方法](#初始化方法)
- [客户端方法](#客户端方法)
- [配置选项](#配置选项)
- [类型定义](#类型定义)
- [插件系统](#插件系统)
- [工具函数](#工具函数)

---

## 初始化方法

### `init(options: SDK.InitOptions): SDK.Client`

初始化 Rewind SDK 并返回客户端实例。

**参数：**
- `options` - 初始化配置选项

**返回值：**
- `SDK.Client` - SDK 客户端实例

**示例：**

```typescript
import { init } from '@rewind-dev/sdk';

const client = init({
  dsn: 'https://your-server.com/api/v1/report',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  environment: 'production'
});
```

### `getClient(): SDK.Client | null`

获取当前的 SDK 客户端实例。

**返回值：**
- `SDK.Client | null` - 客户端实例，如果未初始化则返回 null

**示例：**

```typescript
import { getClient } from '@rewind-dev/sdk';

const client = getClient();
if (client) {
  client.captureError(new Error('Something went wrong'));
}
```

---

## 客户端方法

### `captureError(error: Error, extra?: Record<string, any>): void`

手动捕获并上报错误。

**参数：**
- `error` - 要捕获的错误对象
- `extra` - 可选的额外信息

**示例：**

```typescript
const client = getClient();

try {
  riskyOperation();
} catch (error) {
  client?.captureError(error, {
    extra: {
      userId: '123',
      action: 'checkout',
      step: 'payment'
    }
  });
}
```

### `addBreadcrumb(breadcrumb: Breadcrumb): void`

添加面包屑记录。

**参数：**
- `breadcrumb` - 面包屑对象

**示例：**

```typescript
const client = getClient();

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

### `sendEvent(event: SDKEvent): void`

发送自定义事件。

**参数：**
- `event` - 事件对象

**示例：**

```typescript
const client = getClient();

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

### `setUser(user: UserInfo): void`

设置用户信息。

**参数：**
- `user` - 用户信息对象

**示例：**

```typescript
const client = getClient();

client?.setUser({
  id: 'user-123',
  email: 'user@example.com',
  username: 'john_doe'
});
```

### `setTag(key: string, value: string): void`

设置单个标签。

**参数：**
- `key` - 标签键
- `value` - 标签值

**示例：**

```typescript
const client = getClient();

client?.setTag('feature', 'checkout');
client?.setTag('version', '2.1.0');
```

### `setTags(tags: Record<string, string>): void`

批量设置标签。

**参数：**
- `tags` - 标签对象

**示例：**

```typescript
const client = getClient();

client?.setTags({
  team: 'frontend',
  feature: 'checkout',
  version: '2.1.0'
});
```

### `setContext(key: string, context: any): void`

设置上下文信息。

**参数：**
- `key` - 上下文键
- `context` - 上下文值

**示例：**

```typescript
const client = getClient();

client?.setContext('device', {
  model: 'iPhone 13',
  os: 'iOS 15.0'
});
```

### `clearBreadcrumbs(): void`

清空所有面包屑记录。

**示例：**

```typescript
const client = getClient();
client?.clearBreadcrumbs();
```

### `registerPlugin(plugin: SDK.Plugin): void`

注册插件。

**参数：**
- `plugin` - 插件实例

**示例：**

```typescript
import { getClient, ErrorPlugin } from '@rewind-dev/sdk';

const client = getClient();
client?.registerPlugin(new ErrorPlugin());
```

### `unregisterPlugin(pluginName: string): void`

注销插件。

**参数：**
- `pluginName` - 插件名称

**示例：**

```typescript
const client = getClient();
client?.unregisterPlugin('error-plugin');
```

---

## 配置选项

### `SDK.InitOptions`

SDK 初始化配置接口。

```typescript
interface InitOptions {
  // 必需配置
  dsn: string;                          // 数据上报地址
  appId: string;                        // 应用 ID
  appVersion: string;                   // 应用版本
  
  // 可选配置
  environment?: string;                 // 环境标识
  sampleRate?: number;                  // 采样率 (0-1)
  maxBreadcrumbs?: number;              // 最大面包屑数量
  enabled?: boolean;                    // 是否启用
  debug?: boolean;                      // 调试模式
  
  // 用户信息
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
  
  // 标签
  tags?: Record<string, string>;
  
  // 插件配置
  enableBlankScreenDetection?: boolean; // 启用白屏检测
  enableApiMonitoring?: boolean;        // 启用 API 监控
  
  // 传输配置
  transport?: {
    batchSize?: number;                 // 批量大小
    flushInterval?: number;             // 刷新间隔
    maxRetries?: number;                // 最大重试次数
  };
  
  // 回调函数
  beforeSend?: (event: SDKEvent) => SDKEvent | null;
  onSuccess?: (event: SDKEvent) => void;
  onError?: (error: Error, event: SDKEvent) => void;
}
```

### 配置示例

#### 基础配置

```typescript
init({
  dsn: 'https://your-server.com/api/v1/report',
  appId: 'your-app-id',
  appVersion: '1.0.0'
});
```

#### 完整配置

```typescript
init({
  // 必需配置
  dsn: 'https://your-server.com/api/v1/report',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  
  // 环境配置
  environment: 'production',
  sampleRate: 0.1,                    // 10% 采样
  maxBreadcrumbs: 50,
  enabled: true,
  debug: false,
  
  // 用户信息
  user: {
    id: 'user-123',
    email: 'user@example.com',
    username: 'john_doe'
  },
  
  // 标签
  tags: {
    team: 'frontend',
    feature: 'checkout'
  },
  
  // 插件配置
  enableBlankScreenDetection: true,
  enableApiMonitoring: true,
  
  // 传输配置
  transport: {
    batchSize: 10,
    flushInterval: 5000,
    maxRetries: 3
  },
  
  // 回调函数
  beforeSend: (event) => {
    // 过滤敏感信息
    if (event.extra?.password) {
      delete event.extra.password;
    }
    return event;
  },
  
  onSuccess: (event) => {
    console.log('事件上报成功:', event);
  },
  
  onError: (error, event) => {
    console.error('事件上报失败:', error, event);
  }
});
```

---

## 类型定义

### `Breadcrumb`

面包屑类型定义。

```typescript
interface Breadcrumb {
  type: string;                         // 类型
  message: string;                      // 消息
  timestamp: number;                    // 时间戳
  level?: 'debug' | 'info' | 'warning' | 'error'; // 级别
  category?: string;                    // 分类
  data?: Record<string, any>;           // 数据
}
```

### `SDKEvent`

SDK 事件类型定义。

```typescript
interface SDKEvent {
  type: string;                         // 事件类型
  message: string;                      // 事件消息
  timestamp: number;                    // 时间戳
  level?: string;                       // 级别
  stack?: string;                       // 堆栈信息
  filename?: string;                    // 文件名
  lineno?: number;                      // 行号
  colno?: number;                       // 列号
  extra?: Record<string, any>;          // 额外信息
  tags?: Record<string, string>;        // 标签
  breadcrumbs?: Breadcrumb[];           // 面包屑
  deviceInfo?: DeviceInfo;              // 设备信息
}
```

### `DeviceInfo`

设备信息类型定义。

```typescript
interface DeviceInfo {
  userAgent: string;                    // 用户代理
  browser: string;                      // 浏览器
  browserVersion: string;               // 浏览器版本
  os: string;                          // 操作系统
  osVersion: string;                   // 操作系统版本
  deviceType: 'desktop' | 'mobile' | 'tablet'; // 设备类型
  screenWidth: number;                 // 屏幕宽度
  screenHeight: number;                // 屏幕高度
  viewportWidth: number;               // 视口宽度
  viewportHeight: number;              // 视口高度
  devicePixelRatio: number;            // 设备像素比
  language: string;                    // 语言
  timezone: string;                    // 时区
}
```

### `NetworkInfo`

网络信息类型定义。

```typescript
interface NetworkInfo {
  effectiveType?: string;               // 有效连接类型
  downlink?: number;                   // 下行速度
  rtt?: number;                        // 往返时间
  saveData?: boolean;                  // 省流量模式
}
```

---

## 插件系统

### 插件接口

```typescript
interface Plugin {
  name: string;                        // 插件名称
  setup: (client: Client) => void;     // 设置方法
  teardown?: () => void;               // 清理方法
}
```

### 内置插件

#### ErrorPlugin

自动捕获 JavaScript 错误。

```typescript
import { ErrorPlugin } from '@rewind-dev/sdk';

const errorPlugin = new ErrorPlugin({
  captureUnhandledRejections: true,    // 捕获未处理的 Promise 拒绝
  captureConsoleErrors: true,          // 捕获 console.error
});
```

#### BehaviorPlugin

记录用户行为轨迹。

```typescript
import { BehaviorPlugin } from '@rewind-dev/sdk';

const behaviorPlugin = new BehaviorPlugin({
  captureClicks: true,                 // 捕获点击事件
  captureNavigation: true,             // 捕获导航事件
  captureFormSubmits: true,            // 捕获表单提交
});
```

#### BlankScreenPlugin

检测白屏问题。

```typescript
import { BlankScreenPlugin } from '@rewind-dev/sdk';

const blankScreenPlugin = new BlankScreenPlugin({
  fcpTimeout: 8000,                    // FCP 超时时间
  sampleCount: 10,                     // 采样点数量
  threshold: 0.8,                      // 白屏阈值
});
```

#### ApiPlugin

监控 API 请求。

```typescript
import { ApiPlugin } from '@rewind-dev/sdk';

const apiPlugin = new ApiPlugin({
  captureXHR: true,                    // 捕获 XMLHttpRequest
  captureFetch: true,                  // 捕获 Fetch API
  captureErrors: true,                 // 捕获请求错误
  capturePerformance: true,            // 捕获性能数据
});
```

### 自定义插件

```typescript
class CustomPlugin implements SDK.Plugin {
  name = 'custom-plugin';
  
  setup(client: SDK.Client) {
    // 插件初始化逻辑
    console.log('Custom plugin initialized');
    
    // 监听自定义事件
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
    // 插件清理逻辑
    console.log('Custom plugin cleaned up');
  }
}

// 使用自定义插件
const client = getClient();
client?.registerPlugin(new CustomPlugin());
```

---

## 工具函数

SDK 提供了一些工具函数，可以独立使用。

### 设备信息工具

#### `getDeviceInfo(): DeviceInfo`

获取设备信息。

```typescript
import { getDeviceInfo } from '@rewind-dev/sdk/utils';

const deviceInfo = getDeviceInfo();
console.log('设备信息:', deviceInfo);
```

#### `getNetworkInfo(): NetworkInfo`

获取网络信息。

```typescript
import { getNetworkInfo } from '@rewind-dev/sdk/utils';

const networkInfo = getNetworkInfo();
console.log('网络信息:', networkInfo);
```

### DOM 工具

#### `getElementPath(params: { element: HTMLElement }): string`

获取元素路径。

```typescript
import { getElementPath } from '@rewind-dev/sdk/utils';

const button = document.querySelector('#buy-button');
const path = getElementPath({ element: button });
console.log('元素路径:', path); // 输出: button#buy-button.btn.btn-primary
```

#### `getElementText(params: { element: HTMLElement, maxLength?: number }): string`

获取元素文本内容。

```typescript
import { getElementText } from '@rewind-dev/sdk/utils';

const element = document.querySelector('.product-title');
const text = getElementText({ element, maxLength: 50 });
console.log('元素文本:', text);
```

#### `getElementSelector(params: { element: HTMLElement, maxDepth?: number }): string`

获取元素选择器。

```typescript
import { getElementSelector } from '@rewind-dev/sdk/utils';

const element = document.querySelector('.product-item');
const selector = getElementSelector({ element, maxDepth: 5 });
console.log('元素选择器:', selector);
```

#### `isElementVisible(params: { element: HTMLElement }): boolean`

检查元素是否可见。

```typescript
import { isElementVisible } from '@rewind-dev/sdk/utils';

const element = document.querySelector('.modal');
const visible = isElementVisible({ element });
console.log('元素可见:', visible);
```

### 安全执行工具

#### `safeExecute<T>(params: { fn: () => T, fallback?: T, context?: any }): T`

安全执行函数。

```typescript
import { safeExecute } from '@rewind-dev/sdk/utils';

const result = safeExecute({
  fn: () => {
    // 可能出错的代码
    return JSON.parse(data);
  },
  fallback: null,
  context: 'parsing user data'
});
```

### 节流防抖工具

#### `throttle<T>(params: { fn: T, delay: number }): T`

创建节流函数。

```typescript
import { throttle } from '@rewind-dev/sdk/utils';

const throttledHandler = throttle({
  fn: (event) => {
    console.log('滚动事件:', event);
  },
  delay: 100
});

window.addEventListener('scroll', throttledHandler);
```

#### `debounce<T>(params: { fn: T, delay: number }): T`

创建防抖函数。

```typescript
import { debounce } from '@rewind-dev/sdk/utils';

const debouncedHandler = debounce({
  fn: (value) => {
    console.log('搜索:', value);
  },
  delay: 300
});

input.addEventListener('input', (e) => {
  debouncedHandler(e.target.value);
});
```

---

## 错误处理

### 错误类型

SDK 定义了以下错误类型：

```typescript
enum ErrorType {
  JAVASCRIPT_ERROR = 'javascript',      // JavaScript 错误
  PROMISE_REJECTION = 'promise',        // Promise 拒绝
  RESOURCE_ERROR = 'resource',          // 资源加载错误
  NETWORK_ERROR = 'network',            // 网络错误
  BLANK_SCREEN = 'blank_screen',        // 白屏错误
  API_ERROR = 'api',                    // API 错误
  CUSTOM_ERROR = 'custom'               // 自定义错误
}
```

### 错误级别

```typescript
enum ErrorLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal'
}
```

### 错误处理示例

```typescript
// 捕获特定类型的错误
client?.captureError(new Error('API 请求失败'), {
  extra: {
    type: ErrorType.API_ERROR,
    level: ErrorLevel.ERROR,
    url: '/api/users',
    status: 500,
    response: 'Internal Server Error'
  }
});

// 捕获自定义错误
client?.captureError(new Error('业务逻辑错误'), {
  extra: {
    type: ErrorType.CUSTOM_ERROR,
    level: ErrorLevel.WARNING,
    module: 'checkout',
    step: 'payment',
    userId: 'user-123'
  }
});
```

---

## 性能监控

### 性能指标

SDK 自动收集以下性能指标：

```typescript
interface PerformanceMetrics {
  // 页面加载性能
  navigationStart: number;              // 导航开始时间
  domContentLoaded: number;             // DOM 内容加载完成时间
  loadComplete: number;                 // 页面加载完成时间
  
  // Core Web Vitals
  fcp: number;                         // 首次内容绘制
  lcp: number;                         // 最大内容绘制
  fid: number;                         // 首次输入延迟
  cls: number;                         // 累积布局偏移
  
  // 自定义指标
  ttfb: number;                        // 首字节时间
  tti: number;                         // 可交互时间
}
```

### 手动记录性能

```typescript
// 记录自定义性能指标
client?.sendEvent({
  type: 'performance',
  message: '页面加载性能',
  timestamp: Date.now(),
  extra: {
    loadTime: 1200,
    renderTime: 800,
    apiTime: 400
  }
});

// 使用 Performance API
const mark = performance.mark('custom-operation-start');
// ... 执行操作
performance.mark('custom-operation-end');
performance.measure('custom-operation', 'custom-operation-start', 'custom-operation-end');

const measure = performance.getEntriesByName('custom-operation')[0];
client?.sendEvent({
  type: 'performance',
  message: '自定义操作性能',
  timestamp: Date.now(),
  extra: {
    duration: measure.duration,
    operation: 'custom-operation'
  }
});
```

---

## 调试和开发

### 调试模式

启用调试模式可以在控制台看到详细的日志信息：

```typescript
init({
  dsn: 'your-dsn',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  debug: true  // 启用调试模式
});
```

### 开发环境配置

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

init({
  dsn: 'your-dsn',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  
  // 开发环境配置
  debug: isDevelopment,
  sampleRate: isDevelopment ? 1.0 : 0.1,
  enabled: !isDevelopment || process.env.ENABLE_MONITORING === 'true',
  
  // 开发环境回调
  onSuccess: isDevelopment ? (event) => {
    console.log('✅ 事件上报成功:', event);
  } : undefined,
  
  onError: isDevelopment ? (error, event) => {
    console.error('❌ 事件上报失败:', error, event);
  } : undefined
});
```

---

## 最佳实践

### 1. 初始化时机

```typescript
// ✅ 好的做法：在应用启动早期初始化
// index.js 或 main.js
import { init } from '@rewind-dev/sdk';

init({
  dsn: process.env.REWIND_DSN,
  appId: process.env.REWIND_APP_ID,
  appVersion: process.env.APP_VERSION
});

// 然后启动应用
import('./app').then(({ startApp }) => {
  startApp();
});
```

### 2. 错误边界集成

```typescript
// React 错误边界
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    const client = getClient();
    client?.captureError(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });
  }
}

// Vue 错误处理
app.config.errorHandler = (error, instance, info) => {
  const client = getClient();
  client?.captureError(error, {
    extra: {
      vueErrorInfo: info,
      component: instance?.$options.name
    }
  });
};
```

### 3. 敏感信息过滤

```typescript
init({
  dsn: 'your-dsn',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  
  beforeSend: (event) => {
    // 过滤敏感信息
    const sensitiveKeys = ['password', 'token', 'creditCard', 'ssn'];
    
    if (event.extra) {
      sensitiveKeys.forEach(key => {
        if (event.extra[key]) {
          event.extra[key] = '[Filtered]';
        }
      });
    }
    
    // 过滤 URL 中的敏感参数
    if (event.extra?.url) {
      event.extra.url = event.extra.url.replace(/([?&])(token|key|password)=[^&]*/gi, '$1$2=[Filtered]');
    }
    
    return event;
  }
});
```

### 4. 条件采样

```typescript
// 根据用户类型和环境设置采样率
const getSampleRate = () => {
  const userType = getUserType();
  const environment = process.env.NODE_ENV;
  
  if (environment === 'development') {
    return 1.0;  // 开发环境 100% 采样
  }
  
  switch (userType) {
    case 'internal':
      return 1.0;    // 内部用户 100%
    case 'beta':
      return 0.5;    // Beta 用户 50%
    case 'premium':
      return 0.2;    // 付费用户 20%
    default:
      return 0.05;   // 普通用户 5%
  }
};

init({
  dsn: 'your-dsn',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  sampleRate: getSampleRate()
});
```

---

## 故障排查

### 常见问题

#### 1. SDK 未上报数据

**检查清单：**
- 确认 DSN 地址正确
- 确认网络连接正常
- 检查采样率设置
- 查看浏览器控制台错误

**调试方法：**
```typescript
init({
  dsn: 'your-dsn',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  debug: true,  // 启用调试日志
  
  onSuccess: (event) => {
    console.log('上报成功:', event);
  },
  
  onError: (error, event) => {
    console.error('上报失败:', error, event);
  }
});
```

#### 2. 性能影响

**优化方法：**
```typescript
init({
  dsn: 'your-dsn',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  
  // 降低采样率
  sampleRate: 0.1,
  
  // 减少面包屑数量
  maxBreadcrumbs: 20,
  
  // 批量上报
  transport: {
    batchSize: 20,
    flushInterval: 10000
  }
});
```

---

**最后更新**: 2026-05-05
**文档版本**: v1.0