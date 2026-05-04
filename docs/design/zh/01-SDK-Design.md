# @rewind-dev/sdk — 前端采集 SDK 设计文档

> 基于 PRD v3.0 | 日期：2026-04-29

---

## 一、应用概述

| 属性 | 说明 |
|------|------|
| 包名 | `@rewind-dev/sdk` |
| 技术栈 | TypeScript + Rollup |
| 产物 | npm 包（UMD + ESM） |
| 运行环境 | 用户浏览器（业务应用中） |
| 体积目标 | 核心 gzip < 10KB，全量 < 15KB |
| 零依赖 | 不引入任何第三方运行时库 |

---

## 二、目录结构

```
packages/sdk/
├── src/
│   ├── core/
│   │   ├── client.ts              # SDK 主入口，管理生命周期
│   │   ├── plugin-manager.ts      # 插件注册与调度
│   │   ├── event-bus.ts           # 内部事件总线（发布/订阅）
│   │   └── config.ts             # 配置管理与默认值
│   │
│   ├── breadcrumb/
│   │   └── manager.ts            # 环形缓冲区实现
│   │
│   ├── plugins/
│   │   ├── error.ts              # 错误捕获插件
│   │   ├── blank-screen.ts       # 白屏检测插件
│   │   ├── api.ts                # 接口监控插件（XHR + Fetch 劫持）
│   │   ├── behavior.ts           # 行为录制插件（点击/路由/输入/可见性）
│   │   └── performance.ts        # 性能采集插件（Web Vitals）
│   │
│   ├── transport/
│   │   ├── sender.ts             # 发送器（sendBeacon / fetch / XHR 降级）
│   │   ├── queue.ts              # 内存上报队列 + 批量/定时/紧急触发
│   │   └── offline.ts            # 离线缓存（localStorage 重试队列）
│   │
│   ├── utils/
│   │   ├── dom.ts                # DOM 工具（元素路径提取、文本截断）
│   │   ├── url.ts                # URL 脱敏（去除敏感参数）
│   │   ├── uuid.ts               # sessionId / eventId 生成
│   │   └── safe.ts               # safeExecute 包装器（try-catch 保护）
│   │
│   └── index.ts                  # 公开 API 导出
│
├── __tests__/                    # 单元测试
├── rollup.config.js
├── tsconfig.json
└── package.json
```

---

## 三、核心架构

### 3.1 插件化架构

```
                    ┌──────────────┐
                    │   Client     │  ← 对外暴露 init / captureError / setUser
                    │  (单例)      │
                    └──────┬───────┘
                           │ 管理
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        PluginManager  BreadcrumbMgr  TransportQueue
              │                            │
    ┌─────┬──┴──┬──────┬──────┐           │
    ▼     ▼     ▼      ▼      ▼           ▼
  Error  Blank  API  Behavior Perf      Sender
  Plugin Screen Plugin Plugin Plugin   (beacon/fetch/xhr)
         Plugin
```

### 3.2 核心类

```typescript
// ==================== 插件接口 ====================
interface Plugin {
  name: string;
  setup(client: Client): void;
  teardown?(): void;
}

// ==================== Client 主类 ====================
class Client {
  private static instance: Client | null = null;
  private config: ResolvedConfig;
  private pluginManager: PluginManager;
  private breadcrumbManager: BreadcrumbManager;
  private transportQueue: TransportQueue;

  // 公开 API
  static init(options: SDKConfig): void;
  static captureError(error: Error, context?: Record<string, any>): void;
  static addBreadcrumb(crumb: Partial<Breadcrumb>): void;
  static setUser(user: { id: string; [key: string]: any }): void;

  // 内部方法（供插件调用）
  pushEvent(event: SDKEvent): void;
  getBreadcrumbs(): Breadcrumb[];
  getRecentRequests(): RequestRecord[];
  getConfig(): ResolvedConfig;
}

// ==================== 配置 ====================
interface SDKConfig {
  dsn: string;
  appId: string;
  appVersion: string;
  environment?: string;           // 默认 'production'
  errorSampleRate?: number;       // 默认 1.0
  performanceSampleRate?: number;  // 默认 0.5
  maxBatchSize?: number;          // 默认 10
  flushInterval?: number;         // 默认 5000ms
  breadcrumbsLimit?: number;      // 默认 30
  enableBlankScreen?: boolean;    // 默认 true
  blankScreenTimeout?: number;    // 默认 3000ms
  apiErrorFilter?: (response: any) => boolean;
  beforeSend?: (event: SDKEvent) => SDKEvent | null;
  onError?: (error: Error) => void;
}
```

### 3.3 环形缓冲区

```typescript
class BreadcrumbManager {
  private buffer: (Breadcrumb | null)[];
  private cursor = 0;
  private size = 0;
  private limit: number;

  constructor(limit: number = 30) {
    this.limit = limit;
    this.buffer = new Array(limit).fill(null);
  }

  push(crumb: Breadcrumb): void {
    this.buffer[this.cursor] = crumb;
    this.cursor = (this.cursor + 1) % this.limit;
    if (this.size < this.limit) this.size++;
  }

  // 返回按时间排序的快照（从最旧到最新）
  snapshot(): Breadcrumb[] {
    const result: Breadcrumb[] = [];
    const start = this.size < this.limit ? 0 : this.cursor;
    for (let i = 0; i < this.size; i++) {
      const idx = (start + i) % this.limit;
      if (this.buffer[idx]) result.push(this.buffer[idx]!);
    }
    return result;
  }

  clear(): void {
    this.buffer.fill(null);
    this.cursor = 0;
    this.size = 0;
  }
}
```

---

## 四、各插件设计

### 4.1 错误捕获插件 (error.ts)

**职责**：捕获 JS 运行时错误、Promise 未捕获异常、资源加载失败

**实现要点**：
- `window.onerror`：保存并调用原有 handler，避免覆盖业务代码的错误处理
- `unhandledrejection`：提取 reason 的 message 和 stack
- 资源错误：在捕获阶段监听 `error` 事件，通过 `target.tagName` 区分资源错误和 JS 错误
- 每条错误自动附带 `breadcrumbs` 快照和 `recentRequests`
- 错误事件触发 `transportQueue.flushNow()`（优先上报）

```typescript
// 错误事件构造
function buildErrorEvent(client: Client, data: ErrorData): SDKEvent {
  return {
    type: 'error',
    subType: data.subType,
    timestamp: Date.now(),
    data: {
      message: data.message,
      stack: data.stack || '',
      filename: data.filename,
      lineno: data.lineno,
      colno: data.colno,
      ...data.extra,
    },
    breadcrumbs: client.getBreadcrumbs(),
    requestContext: client.getRecentRequests(),
  };
}
```

### 4.2 白屏检测插件 (blank-screen.ts)

**职责**：检测页面白屏（FCP 超时 + DOM 采样双重确认）

**流程**：

```
页面加载 → 启动 PerformanceObserver 监听 FCP
        → 启动超时定时器（默认 3s）
              ↓
        超时触发：
        ├── FCP 已触发 → 不是白屏，结束
        └── FCP 未触发 → DOM 采样检测
                          ├── 采样点有内容 → 不是白屏（FCP 可能延迟）
                          └── 采样点均为空 → 确认白屏，上报事件
```

**DOM 采样**：视口中心 + 四角共 5 个点，`document.elementFromPoint(x, y)`

### 4.3 接口监控插件 (api.ts)

**职责**：劫持 XHR 和 Fetch，自动记录接口请求并检测异常

**实现要点**：
- **Fetch 劫持**：替换 `window.fetch`，在 then/catch 中记录
- **XHR 劫持**：重写 `XMLHttpRequest.prototype.open` 和 `send`，在 `onreadystatechange` 中记录
- 每条请求同时写入 BreadcrumbManager（作为面包屑）和 RequestRecordBuffer（最近 10 条接口记录）
- 接口异常时额外生成一条 `api_error` 类型的 SDKEvent
- URL 自动脱敏：去除 `token`、`password`、`secret` 等参数

```typescript
// RequestRecord 缓冲区（最近 10 条，供错误事件关联）
class RequestRecordBuffer {
  private buffer: RequestRecord[] = [];
  private limit = 10;

  push(record: RequestRecord): void {
    this.buffer.push(record);
    if (this.buffer.length > this.limit) this.buffer.shift();
  }

  snapshot(): RequestRecord[] {
    return [...this.buffer];
  }
}
```

### 4.4 行为录制插件 (behavior.ts)

**职责**：记录用户操作（点击、路由、输入、可见性），写入 BreadcrumbManager

**各行为的采集细节**：

| 行为 | 监听 | 生成的 message 示例 |
|------|------|---------------------|
| 点击 | `document.addEventListener('click')` | `点击 [提交订单] 按钮 (button#submit.btn-primary)` |
| 路由 | 劫持 `pushState/replaceState` + `popstate` | `路由跳转 /home → /user/123` |
| 输入 | `document.addEventListener('input')` 节流 500ms | `输入 [搜索框] (input#search) 12个字符` |
| 可见性 | `visibilitychange` | `页面隐藏` / `页面显示（隐藏了 30s）` |

**元素路径提取**：

```typescript
// dom.ts
function getElementPath(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const cls = el.className
    ? '.' + String(el.className).trim().split(/\s+/).slice(0, 2).join('.')
    : '';
  return `${tag}${id}${cls}`;
}

function getElementText(el: HTMLElement): string {
  const text = el.textContent?.trim() || el.getAttribute('aria-label') || '';
  return text.length > 50 ? text.slice(0, 50) + '...' : text;
}
```

### 4.5 性能采集插件 (performance.ts)

**职责**：采集 Web Vitals（FCP/LCP/FID/CLS/TTFB）+ 页面加载时序

**实现**：使用 PerformanceObserver API，各指标独立观察，页面卸载前统一上报

---

## 五、上报机制

### 5.1 TransportQueue

```typescript
class TransportQueue {
  private queue: SDKEvent[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private sender: Sender;
  private config: ResolvedConfig;

  push(event: SDKEvent): void {
    // beforeSend 钩子
    const processed = this.config.beforeSend?.(event) ?? event;
    if (!processed) return; // 返回 null 表示丢弃

    this.queue.push(processed);

    // 错误事件立即上报
    if (['error', 'blank_screen', 'api_error'].includes(event.type)) {
      this.flush();
      return;
    }

    // 数量触发
    if (this.queue.length >= this.config.maxBatchSize) {
      this.flush();
      return;
    }

    // 定时触发
    this.startTimer();
  }

  flush(): void {
    if (this.queue.length === 0) return;
    this.clearTimer();

    const batch = this.queue.splice(0);
    const payload: ReportPayload = {
      appId: this.config.appId,
      sessionId: this.config.sessionId,
      events: batch,
      meta: {
        sdkVersion: SDK_VERSION,
        appVersion: this.config.appVersion,
        environment: this.config.environment,
        device: getDeviceInfo(),
      },
    };

    this.sender.send(payload).catch(() => {
      // 发送失败，存入离线队列
      OfflineStorage.save(batch);
    });
  }

  // 页面隐藏时触发
  setupPageHideListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
  }
}
```

### 5.2 Sender（传输降级）

```typescript
class Sender {
  async send(payload: ReportPayload): Promise<void> {
    const body = JSON.stringify(payload);
    const url = this.dsn;
    const headers = { 'Content-Type': 'application/json', 'X-API-Key': this.apiKey };

    // 优先 sendBeacon（页面卸载时最可靠）
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon(url, blob)) return;
    }

    // 其次 fetch + keepalive
    if (typeof fetch === 'function') {
      await fetch(url, { method: 'POST', headers, body, keepalive: true });
      return;
    }

    // 最后 XHR
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
      xhr.onload = () => resolve();
      xhr.onerror = () => reject(new Error('XHR failed'));
      xhr.send(body);
    });
  }
}
```

---

## 六、打包与发布

### 6.1 Rollup 配置

```javascript
// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'src/index.ts',
    output: { file: 'dist/rewind.esm.js', format: 'es', sourcemap: true },
    plugins: [nodeResolve(), typescript(), terser()],
    external: [],  // 零外部依赖
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/rewind.umd.js', format: 'umd', name: 'Rewind', sourcemap: true },
    plugins: [nodeResolve(), typescript(), terser()],
  },
];
```

### 6.2 package.json

```json
{
  "name": "@rewind-dev/sdk",
  "version": "0.1.0",
  "main": "dist/rewind.umd.js",
  "module": "dist/rewind.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "sideEffects": false,
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "vitest run",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@rewind-dev/shared": "workspace:*"
  },
  "devDependencies": {
    "rollup": "^4.0.0",
    "@rollup/plugin-typescript": "^11.0.0",
    "rollup-plugin-terser": "^7.0.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
```

### 6.3 体积预算

| 模块 | 预估 gzip |
|------|-----------|
| core（Client + PluginManager + EventBus + Config） | ~2KB |
| breadcrumb（环形缓冲区） | ~0.5KB |
| transport（Queue + Sender + Offline） | ~1.5KB |
| plugins/error | ~1.5KB |
| plugins/blank-screen | ~0.5KB |
| plugins/api | ~1.5KB |
| plugins/behavior | ~1.5KB |
| plugins/performance | ~1.5KB |
| utils | ~0.5KB |
| **全量合计** | **~11KB** |

---

## 七、SDK 任务清单

| 编号 | 任务 | 预估 | 阶段 | 依赖 |
|------|------|------|------|------|
| SDK-01 | Client 主类 + Config 管理 + 公开 API | 1d | P0-a | - |
| SDK-02 | PluginManager 插件注册与调度 | 0.5d | P0-a | 01 |
| SDK-03 | EventBus 内部事件总线 | 0.5d | P0-a | - |
| SDK-04 | BreadcrumbManager 环形缓冲区 | 0.5d | P0-a | - |
| SDK-05 | TransportQueue 上报队列（批量+定时+紧急） | 1d | P0-a | 01 |
| SDK-06 | Sender 传输降级（beacon/fetch/xhr） | 0.5d | P0-a | 05 |
| SDK-07 | OfflineStorage 离线缓存 | 0.5d | P0-a | 06 |
| SDK-08 | Error 插件（onerror/rejection/资源） | 1.5d | P0-a | 01-04 |
| SDK-09 | Behavior 插件（点击/路由/输入/可见性） | 1.5d | P0-a | 01, 04 |
| SDK-10 | DOM 工具 + URL 脱敏工具 | 0.5d | P0-a | - |
| SDK-11 | Rollup 打包配置 + 体积验证 | 0.5d | P0-a | 01-10 |
| SDK-12 | BlankScreen 插件（FCP 超时+DOM 采样） | 1.5d | P0-c | 01, 04 |
| SDK-13 | API 插件（XHR+Fetch 劫持+异常判定） | 2d | P0-c | 01, 04 |
| SDK-14 | Performance 插件（Web Vitals） | 1.5d | P2 | 01 |
