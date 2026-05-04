# Rewind — 前端智能监控与问题定位平台 需求文档

> 版本：v3.0 | 日期：2026-04-29

---

## 一、项目概述

### 1.1 项目名称

Rewind — 面向前端开发者的智能监控与问题定位平台

### 1.2 核心问题

前端线上问题最大的痛点不是"发现不了"，而是**"复现不了、定位不了"**。

开发者日常面对的困境：

- 用户反馈"页面白屏了"，开发者无法复现，也不知道用户做了什么操作
- 错误日志只有一行 `Cannot read property 'x' of undefined`，缺少触发上下文
- 接口报错了，但不知道用户当时的操作路径是什么
- 同一个错误被上报了上万次，真正的新问题被淹没在噪音中
- 排查一个线上 Bug 平均需要 1-2 小时，大量时间花在"猜测复现路径"上

### 1.3 产品定位

Rewind 不是一个通用的监控数据看板，而是一个帮助前端开发者**快速定位和复现线上问题**的工具。

```
传统监控：  错误发生 → 看到报错 → 手动排查 → 尝试复现 → 猜测原因 → 修复
                                    ↑ 耗时最长、最痛苦的环节

Rewind：错误发生 → 自动归类去噪 → 还原操作轨迹 → AI 整理线索 → 定位修复
                                        ↑ 核心价值：让每个错误都有迹可循
```

**核心差异**：
- 不只告诉你"出了什么错"，而是告诉你"用户做了什么导致出错"
- 不只展示错误堆栈，而是还原错误发生前的完整操作轨迹与接口记录
- 不只罗列数据，而是通过 AI 整理错误上下文，帮开发者快速理解问题全貌

### 1.4 目标用户

| 角色 | 核心诉求 |
|------|----------|
| 前端开发者 | 快速定位错误根因，还原用户操作路径复现问题 |
| 团队 Leader | 掌握项目质量趋势，识别系统性风险，评估发版质量 |
| QA / 测试 | 通过行为回放验证 Bug，减少"无法复现"的沟通成本 |

### 1.5 核心目标

| 目标 | 量化指标 |
|------|----------|
| 问题可复现 | 每个错误事件自动关联操作轨迹，开发者可在工作台还原触发路径 |
| 噪音可过滤 | 错误指纹自动归并同类问题，准确率 > 95% |
| 定位可提速 | 从发现错误到理解根因的时间从小时级降至分钟级 |
| 采集低侵入 | SDK gzip < 15KB，对宿主性能影响 < 1% |
| 异常可感知 | 错误激增、白屏等关键异常主动推送通知 |


---

## 二、系统架构

### 2.1 整体架构

```
┌──────────────────────────────────────────────────────────────┐
│                  可视化问题定位平台 (React)                     │
│   项目总览 │ 问题定位工作台⭐ │ 错误管理 │ 性能分析 │ AI 洞察   │
└────────────────────────┬─────────────────────────────────────┘
                         │ REST / WebSocket
┌────────────────────────▼─────────────────────────────────────┐
│                     后端服务 (NestJS)                          │
│                                                               │
│  数据接收 → 处理管线 → 指纹归并 → 上下文关联存储                  │
│                    ↘                                          │
│              告警引擎  ←→  AI 分析引擎 (可插拔)                  │
│                                                               │
│  队列处理 (BullMQ) │ 限流 (Redis) │ 缓存 (Redis)              │
└───────┬──────────────┬──────────────┬────────────────────────┘
        │              │              │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │PostgreSQL│   │  Redis  │   │对象存储  │
   │  主存储   │   │ 缓存/队列│   │SourceMap│
   └─────────┘   └─────────┘   └─────────┘

┌──────────────────────────────────────────────────────────────┐
│                    前端 SDK (TypeScript)                       │
│  错误捕获 │ 白屏检测 │ 接口监控 │ 行为录制⭐ │ 性能采集 │ 上报  │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 工程架构

项目采用 Monorepo 架构，由 4 个包组成：

| 包 | 说明 | 技术栈 |
|---|------|--------|
| `@rewind-dev/shared` | 共享 TypeScript 类型定义 | TypeScript（仅类型，无运行时） |
| `@rewind-dev/sdk` | 前端采集 SDK | TypeScript + Rollup |
| `@rewind-dev/server` | 后端服务 | NestJS + Prisma + PostgreSQL + Redis |
| `@rewind-dev/dashboard` | 可视化平台 | React + Vite + Redux Toolkit + TanStack Router |

工具链：**pnpm workspace**（包管理）+ **Turborepo**（构建编排与缓存）

### 2.3 核心数据流：从错误到定位

```
用户操作 → SDK 持续录制行为轨迹（环形缓冲区，最近 30 条）
              同时监控接口请求
                    ↓
            错误 / 白屏 / 接口异常 发生
                    ↓
SDK 自动快照：错误信息 + 堆栈 + 行为轨迹 + 最近接口记录 + 设备环境
                    ↓
            批量上报（错误事件优先发送）
                    ↓
后端管线：SourceMap 还原 → 指纹计算 → Issue 归并 → 上下文关联入库
                    ↓
            ┌─────────────────────────────┐
            │     问题定位工作台            │
            │                             │
            │  ① 源码级错误堆栈            │
            │  ② 错误前操作轨迹时间线      │
            │  ③ 关联接口请求详情          │
            │  ④ 环境差异高亮             │
            │  ⑤ 多事件路径对比           │
            │  ⑥ AI 上下文整理 + 线索分析  │
            └─────────────────────────────┘
```


---

## 三、功能模块详细需求

### 模块一：前端 SDK（@rewind-dev/sdk）

#### 3.1.1 设计原则

- TypeScript 编写，打包为 UMD + ESM
- 插件化架构：核心引擎 + 可选插件，支持 Tree-shaking
- 核心包（错误 + 行为 + 上报）gzip < 10KB，全量 < 15KB
- 零第三方运行时依赖
- 全局 try-catch 保护，SDK 内部错误绝不影响宿主应用
- **行为录制是核心能力，默认开启**

#### 3.1.2 初始化配置

```typescript
import { init } from '@rewind-dev/sdk';

init({
  dsn: 'https://your-server.com/api/v1/report',
  appId: 'app_xxxx',
  appVersion: '1.2.0',
  environment: 'production',

  // 采样（错误默认全量采集，性能可降采样）
  errorSampleRate: 1.0,
  performanceSampleRate: 0.5,

  // 上报策略
  maxBatchSize: 10,
  flushInterval: 5000,

  // 行为录制
  breadcrumbsLimit: 30,         // 环形缓冲区大小

  // 白屏检测
  enableBlankScreen: true,
  blankScreenTimeout: 3000,     // FCP 超时阈值(ms)

  // 接口监控
  apiErrorFilter: (res) => res.data?.code !== 0,  // 自定义业务错误判定

  // 钩子
  beforeSend: (event) => event,
});
```

#### 3.1.3 错误捕获

| 采集类型 | 实现方式 | 说明 |
|----------|----------|------|
| JS 运行时错误 | `window.onerror` | message / filename / lineno / colno / stack |
| Promise 未捕获 | `unhandledrejection` | reason / stack |
| 资源加载失败 | `addEventListener('error', ..., true)` | 资源 URL、类型 |
| 框架错误 | Vue `errorHandler` / React `ErrorBoundary` 适配 | 组件名、stack |
| 自定义上报 | `Rewind.captureError(err, context?)` | 可附加业务上下文 |

**每条错误事件自动关联**：

```typescript
interface ErrorEvent {
  type: 'js_error' | 'unhandled_rejection' | 'resource_error' | 'api_error' | 'blank_screen';
  message: string;
  stack?: string;

  // ⭐ 问题定位的关键上下文
  breadcrumbs: Breadcrumb[];       // 错误前的操作轨迹
  recentRequests: RequestRecord[]; // 错误前后的接口请求

  // 环境信息
  pageUrl: string;
  referrer: string;
  device: { os: string; browser: string; screen: string };
  environment: string;
  appVersion: string;
  sessionId: string;
  userId?: string;
  timestamp: number;
}
```

#### 3.1.4 白屏检测

白屏是用户反馈最多但最难复现的问题类型，SDK 需要主动检测。

**检测策略（双重检测）**：

1. **FCP 超时检测**：页面加载后超过 `blankScreenTimeout`（默认 3s）仍未触发 FCP 事件，判定为疑似白屏
2. **DOM 采样检测**：在超时时刻对页面关键区域（视口中心及四角共 5 个采样点）进行 `document.elementFromPoint` 检测，如果采样点均为 `<html>` 或 `<body>`，确认白屏

**白屏事件上报内容**：
- 检测方式（FCP 超时 / DOM 采样）
- 页面 URL
- 当前 DOM 根节点子元素数量
- 行为轨迹（白屏前用户做了什么）
- 最近接口请求（是否有接口阻塞或失败）

#### 3.1.5 接口监控

通过劫持 `XMLHttpRequest` 和 `fetch` 自动采集，无需业务代码改动。

| 采集字段 | 说明 |
|----------|------|
| url | 请求地址（自动脱敏敏感参数） |
| method | 请求方法 |
| status | HTTP 状态码 |
| duration | 耗时(ms) |
| isError | 是否异常（状态码 >= 400 / 超时 / 网络错误 / 业务错误码） |
| timestamp | 请求发起时间 |

**异常判定**（可配置）：
- HTTP 状态码 >= 400
- 请求超时（默认 30s）
- 网络错误（`TypeError: Failed to fetch`）
- 业务错误码（通过 `apiErrorFilter` 自定义）

接口异常会同时作为一条 breadcrumb 记录，并在错误事件中作为 `recentRequests` 关联上报。

#### 3.1.6 行为录制（核心能力）

持续记录用户操作，错误发生时自动快照最近的操作序列，帮助还原"错误是怎么发生的"。

**采集的行为类型**：

| 行为 | 采集方式 | 记录内容 | 默认 |
|------|----------|----------|------|
| 点击 | 全局 `click` 代理 | 元素路径（tag#id.class）、文本（截断 50 字）、坐标 | ✅ 开启 |
| 路由变化 | `popstate` + `pushState/replaceState` 劫持 | from → to URL、停留时长 | ✅ 开启 |
| 输入 | `input/change` 事件 | 元素标识、输入长度（**不记录内容，保护隐私**） | ✅ 开启 |
| 接口请求 | XHR/Fetch 劫持 | URL、method、status、duration | ✅ 开启 |
| 页面可见性 | `visibilitychange` | 隐藏/显示切换 | ✅ 开启 |
| 滚动 | `scroll` 节流 | 方向、位置百分比 | ❌ 默认关闭（高频场景数据量大） |
| Console | `console.error/warn` 劫持 | 日志内容截断 | ❌ 默认关闭（易与其他工具冲突） |
| 自定义 | `Rewind.addBreadcrumb(data)` | 业务自定义 | 手动调用 |

**面包屑数据结构**：

```typescript
interface Breadcrumb {
  type: 'click' | 'route' | 'input' | 'api' | 'visibility' | 'scroll' | 'console' | 'custom';
  message: string;      // 可读描述，如 "点击 [提交订单] 按钮"
  data?: Record<string, any>;
  timestamp: number;
  level: 'info' | 'warning' | 'error';
}
```

**环形缓冲区**：
- 固定大小（默认 30 条），新数据覆盖最旧数据，内存占用恒定
- 错误发生时快照当前缓冲区作为该错误的行为上下文
- 不单独上报行为数据，只随错误事件一起上报（减少数据量）

#### 3.1.7 性能采集

| 指标 | 来源 | 说明 |
|------|------|------|
| FCP | PerformanceObserver (`paint`) | 首次内容绘制 |
| LCP | PerformanceObserver (`largest-contentful-paint`) | 最大内容绘制 |
| FID | PerformanceObserver (`first-input`) | 首次输入延迟 |
| CLS | PerformanceObserver (`layout-shift`) | 累计布局偏移 |
| TTFB | Navigation Timing API | 首字节时间 |
| 页面加载时序 | Navigation Timing L2 | 完整加载链路 |
| 长任务 | PerformanceObserver (`longtask`) | > 50ms 主线程阻塞 |

性能数据独立采样（`performanceSampleRate`），与错误采集互不影响。

#### 3.1.8 上报机制

```
事件产生 → 写入内存队列 → 满足触发条件 → 批量序列化 → 发送
                               ↓
                 触发条件（任一满足）：
                 ├── 队列数量 >= maxBatchSize
                 ├── 定时器到达 flushInterval
                 ├── 发生错误/白屏事件（立即触发，不等凑满）
                 └── 页面 visibilitychange → hidden
```

- **传输优先级**：`navigator.sendBeacon` > `fetch(keepalive)` > `XMLHttpRequest`
- **失败降级**：失败数据写入 `localStorage`，下次初始化优先重发（上限 50 条）
- **数据脱敏**：`beforeSend` 钩子 + 内置规则（自动脱敏 URL 中的 token/password 等）


---

### 模块二：后端服务（NestJS）

#### 3.2.1 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | NestJS | 模块化、依赖注入 |
| 数据库 | PostgreSQL | 主存储，JSONB 灵活字段，支持分区 |
| 缓存 | Redis | 热数据缓存、限流、队列后端 |
| 消息队列 | BullMQ | 异步处理：数据清洗、AI 分析、告警 |
| ORM | Prisma | 类型安全数据库访问 |
| 认证 | JWT | Token 认证（简化方案，不做复杂 RBAC） |
| SourceMap | source-map 库 | 堆栈还原 |

#### 3.2.2 数据接收与限流

**上报接口**：`POST /api/v1/report`

```json
{
  "appId": "app_xxxx",
  "sessionId": "sess_xxxx",
  "events": [
    {
      "type": "error",
      "timestamp": 1714300000000,
      "data": {
        "message": "Cannot read property 'name' of undefined",
        "stack": "TypeError: ...",
        "breadcrumbs": [ ... ],
        "recentRequests": [ ... ]
      }
    }
  ],
  "meta": {
    "sdkVersion": "1.0.0",
    "appVersion": "1.2.0",
    "environment": "production",
    "device": { "os": "Windows 11", "browser": "Chrome 120", "screen": "1920x1080" }
  }
}
```

**处理流程**：

1. **限流**：基于 `appId` 滑动窗口限流（Redis），默认 1000 req/min/project
2. **校验**：`class-validator` 结构校验，非法数据丢弃并记录
3. **快速响应**：校验通过立即返回 `204`，数据推入 BullMQ
4. **批量消费**：Worker 每批取 100 条，批量写入数据库

#### 3.2.3 数据处理管线

```
原始事件 → ① 字段标准化 → ② SourceMap 还原 → ③ 指纹计算
  → ④ Issue 归并 → ⑤ 上下文关联存储 → ⑥ 聚合指标更新 → ⑦ 告警检测
```

| 步骤 | 说明 |
|------|------|
| ① 标准化 | UA 解析为结构化设备信息、时间戳统一 UTC |
| ② SourceMap 还原 | 匹配 appId + appVersion 的 SourceMap，还原为源码位置（文件 + 行号 + 源码片段），结果缓存 |
| ③ 指纹计算 | `MD5(error.type + normalize(message) + topFrames(stack, 3))` |
| ④ Issue 归并 | 相同指纹归入同一 Issue，更新 event_count / user_count / last_seen |
| ⑤ 上下文关联 | 错误事件的 breadcrumbs、recentRequests 完整存储，支持后续行为回放 |
| ⑥ 聚合更新 | 性能指标按分钟/小时/天预聚合 |
| ⑦ 告警检测 | 检查是否触发已配置的告警规则 |

#### 3.2.4 错误指纹系统

**message 标准化**（去除动态参数，提高归并准确率）：

```
原始：Request failed with status 404 for /api/users/12345
标准化：Request failed with status {N} for /api/users/{param}

原始：Timeout after 30000ms
标准化：Timeout after {N}ms

原始：Cannot read property 'name' of undefined
标准化：Cannot read property 'name' of undefined（无动态参数，保持原样）
```

**Issue 状态机**：

```
     新建
      ↓
   [open] ──→ [resolved] ──→ [regressed]（已修复问题再次出现，自动触发告警）
     │                            │
     ↓                            ↓
  [ignored]                    [open]（重新打开）
```

#### 3.2.5 SourceMap 管理

- 上传接口：`POST /api/v1/sourcemap`（支持多文件）
- 按 `appId + appVersion` 关联，支持 CI/CD 自动上传
- 还原结果缓存（相同堆栈不重复解析）
- 存储：本地文件系统 / S3 兼容存储
- 清理：保留最近 20 个版本（可配置）

#### 3.2.6 告警引擎

**告警规则**：

```json
{
  "name": "错误激增",
  "metric": "error_count",
  "condition": { "operator": "gt", "threshold": 100, "window": "5m" },
  "filters": { "environment": "production" },
  "actions": [
    { "type": "webhook", "url": "https://hooks.feishu.cn/..." },
    { "type": "email", "to": ["dev@example.com"] }
  ],
  "silencePeriod": "30m"
}
```

**支持的告警指标**：

| 指标 | 说明 |
|------|------|
| `error_count` | 时间窗口内错误总数 |
| `new_issue_count` | 新增 Issue 数 |
| `issue_regressed` | Issue 回归（已修复再次出现） |
| `blank_screen_count` | 白屏事件数 |
| `api_error_rate` | 接口错误率 |
| `lcp_p75` | LCP P75 超阈值 |

**异常检测**（基于简单统计规则，不依赖 AI）：
- 当前窗口指标 vs 历史同期（上周同天同时段）均值
- 偏离超过 3 个标准差时触发告警
- 适用于：错误数突增、接口成功率突降、性能指标突降

**通知渠道**：Webhook（飞书/钉钉/Slack）、邮件


---

### 模块三：可视化问题定位平台（React Dashboard）

#### 3.3.1 技术选型

| 技术 | 说明 |
|------|------|
| React 18 + TypeScript | 主框架 |
| TanStack Router | 类型安全路由，search params 持久化 |
| Redux Toolkit | 状态管理 |
| Ant Design 5 | UI 组件 |
| ECharts | 图表 |
| Axios + React Query | 请求与缓存 |
| Vite | 构建 |

#### 3.3.2 页面结构

##### A. 项目总览 Dashboard

快速回答"现在有没有问题"。

- **健康度评分**：基于错误率 + 接口成功率 + LCP 达标率的综合评分（0-100），颜色直观标识
- **核心指标卡片**：错误总数（较昨日↑↓）、新增 Issue 数、白屏次数、LCP P75、接口成功率
- **错误趋势图**：折线图，支持小时/天/周粒度
- **最近告警**：最近触发的告警，可跳转对应 Issue
- **问题热点**：受影响最多的页面 Top 10

##### B. 错误管理页（Issue 列表）

归并后的 Issue 视图，帮助聚焦真正需要关注的问题。

- **Issue 列表字段**：错误类型图标、消息摘要、发生次数、影响用户数、首次/最近时间、状态
- **排序**：按次数 / 影响用户数 / 最近时间
- **筛选**：时间范围、环境、版本、浏览器、OS、页面 URL、状态、错误类型（含白屏）
- **批量操作**：批量 resolve / ignore
- **Issue 状态流转**：open → resolved / ignored

##### C. 问题定位工作台（Issue 详情页）⭐ 核心页面

围绕"帮开发者定位问题"设计的核心页面。

**整体布局**：

```
┌──────────────────────────────────────────────────────────┐
│ Issue 标题 + 状态标签 + AI 一句话摘要                       │
│ 首次出现: 2026-04-28  最近: 5分钟前  次数: 1,234  用户: 89  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─ 事件选择器 ──────────────────────────────────────────┐│
│ │ 事件 #1 (Chrome/Win) │ 事件 #2 (Safari/iOS) │ ...   ││
│ └───────────────────────────────────────────────────────┘│
│                                                          │
│ ┌─ 源码级错误堆栈 ─────────────────────────────────────┐ │
│ │ TypeError: Cannot read property 'name' of undefined  │ │
│ │   at UserProfile.render (src/pages/User.tsx:42:18)   │ │
│ │   at processChild (react-dom.js:1234)                │ │
│ │                                                      │ │
│ │ ▼ 展开源码片段                                        │ │
│ │   40 | const user = props.data;                      │ │
│ │   41 | return (                                      │ │
│ │ → 42 |   <div>{user.name}</div>  // ← 错误行         │ │
│ │   43 | );                                            │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ 操作轨迹时间线 ⭐ ──────────────────────────────────┐ │
│ │                                                      │ │
│ │ 14:23:01  🔗 路由跳转 /home → /user/123             │ │
│ │ 14:23:03  👆 点击 [编辑资料] 按钮                     │ │
│ │ 14:23:05  ⌨️  输入 [姓名输入框] (12字符)              │ │
│ │ 14:23:06  🌐 POST /api/user/update → 200 (320ms)    │ │
│ │ 14:23:08  👆 点击 [保存] 按钮                         │ │
│ │ 14:23:08  🌐 GET /api/user/123 → 500 (1200ms) ⚠️    │ │
│ │ 14:23:09  💥 TypeError: Cannot read property...      │ │
│ │                                                      │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ 环境差异分析 ───────────────────────────────────────┐ │
│ │                                                      │ │
│ │ 浏览器分布: Chrome 45% │ Safari 52% │ Firefox 3%    │ │
│ │            ⚠️ Safari 占比异常偏高，可能是兼容性问题    │ │
│ │                                                      │ │
│ │ 版本分布:  v1.2.0 (98%) │ v1.1.9 (2%)              │ │
│ │           ⚠️ 集中在 v1.2.0，可能是该版本引入         │ │
│ │                                                      │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ AI 分析面板 ───────────────────────────────────────┐  │
│ │                                                     │  │
│ │ 📋 上下文整理：                                      │  │
│ │ 该错误在用户点击[保存]后触发，此前 GET /api/user/123 │  │
│ │ 返回 500，导致 user 对象为 undefined。错误集中在     │  │
│ │ Safari 浏览器 + v1.2.0 版本。                       │  │
│ │                                                     │  │
│ │ 🔍 可能原因：                                        │  │
│ │ 1. 接口返回异常时缺少空值保护 (置信度: 高)           │  │
│ │ 2. Safari 下接口响应格式可能不同 (置信度: 中)        │  │
│ │                                                     │  │
│ │ 💡 修复方向：                                        │  │
│ │ 在 UserProfile 组件中对 props.data 添加空值检查，    │  │
│ │ 同时排查 /api/user/:id 接口 500 的原因。            │  │
│ │                                                     │  │
│ │ [🔄 重新分析]                                       │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌─ 错误趋势 ──────────────────────────────────────────┐ │
│ │ (该 Issue 的发生频率变化折线图)                       │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

**核心功能详解**：

**① 源码级堆栈**
- SourceMap 还原后展示源文件名 + 行号
- 点击帧可展开对应源码片段（前后各 3 行），错误行高亮
- 未还原的帧（第三方库）灰色显示

**② 操作轨迹时间线**
- 以时间轴形式展示错误发生前的 breadcrumbs
- 每条记录有图标（🔗路由/👆点击/⌨️输入/🌐接口/💥错误）+ 可读描述 + 时间戳
- 接口请求异常的条目红色高亮
- 点击条目可展开详情（如接口的完整 URL、状态码、耗时）

**③ 环境差异高亮**
- 自动分析该 Issue 所有事件的浏览器/OS/版本分布
- 当某个维度占比异常偏高时（如 Safari 占 80% 但全站 Safari 用户只有 30%），自动标注 ⚠️ 提示
- 帮助快速判断是否为特定环境问题

**④ 多事件路径对比**
- 同一 Issue 下可切换查看不同事件实例
- 提供"路径对比"视图：并排展示 2-3 个事件的行为轨迹，高亮共同操作步骤
- 共同的操作路径很可能就是触发条件

**⑤ AI 分析面板**
- 一键触发，异步返回结果
- 重点是"上下文整理"：把行为轨迹、接口记录、环境信息整理成一段可读的分析
- 给出"可能原因"（带置信度）和"修复方向"（非代码级 diff）
- 支持重新分析（当有新事件数据时）

##### D. 性能分析页

- **Web Vitals 概览**：FCP / LCP / FID / CLS / TTFB 的 P50 / P75 / P95，颜色标记达标状态
- **慢页面排行**：按 LCP P75 排序，可下钻查看详情
- **性能趋势**：核心指标随时间变化，支持两个时间段对比（如发版前后）
- **页面加载瀑布图**：DNS → TCP → SSL → TTFB → 下载 → DOM 解析

##### E. AI 洞察页

- **错误摘要列表**：所有 Issue 的 AI 一句话摘要，快速扫描
- **日报**：每日自动生成，包含新增问题、趋势变化、重点关注项
- **异常检测结果**：统计规则检测到的指标异常，附带可能原因

##### F. 项目设置

- 项目信息与 DSN 展示
- SDK 接入指引（代码示例，一键复制）
- 告警规则配置
- SourceMap 管理（上传记录、版本列表）
- 数据保留策略

#### 3.3.3 渲染优化

| 策略 | 场景 |
|------|------|
| 虚拟滚动 | Issue 列表、事件列表 |
| 图表降采样 | 大时间跨度趋势图 |
| Web Worker | 环境分布等前端聚合计算 |
| React Query 缓存 | stale-while-revalidate |
| 骨架屏 | 首屏加载 |
| 分页 + 无限滚动 | 事件列表 |


---

### 模块四：AI 分析引擎（可插拔）

#### 3.4.1 设计理念

AI 在本系统中的定位是**"线索整理员"而非"问题解决者"**。

开发者定位问题时，最耗时的不是修 Bug，而是理解"发生了什么"。AI 的价值在于：
- 把分散的上下文信息（堆栈、行为轨迹、接口记录、环境分布）整理成一段可读的分析
- 指出值得关注的线索（如"接口 500 发生在错误之前"、"集中在 Safari"）
- 给出修复方向（而非代码级 diff，因为没有完整代码仓库上下文）

#### 3.4.2 能力定义

| 能力 | 输入 | 输出 | 触发 | 优先级 |
|------|------|------|------|--------|
| 错误摘要 | 错误信息 + 堆栈 | 一句话摘要 | Issue 创建时自动 | P0 |
| 上下文整理 + 线索分析 | 错误 + 行为轨迹 + 接口记录 + 环境分布 | 结构化分析报告 | 用户手动 / 高频 Issue 自动 | P0 |
| 修复方向建议 | 错误 + 还原后源码上下文 | 修复思路描述（非 diff） | 用户手动 | P1 |
| 日报生成 | 当日统计 + 告警记录 | Markdown 日报 | 每日定时 | P1 |

#### 3.4.3 AI 分析输入上下文

```typescript
// 自动构建的 AI 输入
interface AIContext {
  // 错误本体
  error: {
    type: string;
    message: string;
    stack: string;           // SourceMap 还原后
    sourceSnippet?: string;  // 错误行前后源码
  };

  // ⭐ 行为轨迹（定位的关键线索）
  breadcrumbs: Array<{
    type: string;
    message: string;
    timestamp: number;
  }>;

  // 接口记录
  recentRequests: Array<{
    url: string;
    method: string;
    status: number;
    duration: number;
  }>;

  // 环境分布（该 Issue 所有事件的统计）
  distribution: {
    browsers: Record<string, number>;   // { "Safari": 52, "Chrome": 45, ... }
    os: Record<string, number>;
    versions: Record<string, number>;
  };

  // Issue 统计
  stats: {
    totalEvents: number;
    affectedUsers: number;
    firstSeen: string;
    lastSeen: string;
  };
}
```

#### 3.4.4 AI 分析输出结构

```typescript
interface AIAnalysisResult {
  // 一句话摘要
  summary: string;

  // 上下文整理（可读的分析段落）
  contextAnalysis: string;

  // 可能原因（按置信度排序）
  possibleCauses: Array<{
    description: string;
    confidence: 'high' | 'medium' | 'low';
    evidence: string;  // 支撑证据，引用自行为轨迹/接口记录
  }>;

  // 修复方向
  fixDirection?: {
    description: string;
    steps: string[];     // 建议的排查/修复步骤
  };

  generatedAt: number;
  modelUsed: string;
}
```

#### 3.4.5 技术实现

- **LLM Provider 抽象**：统一接口，支持 OpenAI API / 兼容接口 / 本地模型切换
- **Prompt 模板**：每种分析场景专用模板，后台可调优
- **结果缓存**：相同 fingerprint 的分析结果缓存（TTL 可配置，默认 24h）
- **异步队列**：BullMQ 异步执行，前端轮询获取结果
- **可插拔**：整个 AI 模块作为独立 NestJS Module，可禁用，不影响核心功能
- **成本控制**：可配置每日调用上限，超限降级为仅展示原始数据

---

## 四、数据库设计

### 4.1 ER 关系

```
Project ──┬── Issue ──┬── Event (按月分区)
          │           └── AIAnalysis
          ├── AlertRule ──── AlertHistory
          ├── SourceMap
          └── PerformanceAgg
```

> 注：v3 去掉了 Organization / User / ProjectMember 等多租户表，采用简化的单项目认证方案（JWT + 项目级 API Key）。

### 4.2 核心表

**projects**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(100) | 项目名 |
| app_id | VARCHAR(50) | SDK 使用的项目标识 |
| api_key | VARCHAR(64) | 上报认证密钥 |
| settings | JSONB | 配置（采样率、数据保留天数等） |
| created_at | TIMESTAMP | 创建时间 |

**issues**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| project_id | UUID | 所属项目 |
| fingerprint | VARCHAR(64) | 错误指纹（project_id + fingerprint 联合唯一） |
| type | VARCHAR(50) | 错误类型 |
| message | TEXT | 标准化后的错误信息 |
| status | ENUM | open / resolved / ignored / regressed |
| level | ENUM | fatal / error / warning |
| first_seen | TIMESTAMP | 首次出现 |
| last_seen | TIMESTAMP | 最近出现 |
| event_count | INTEGER | 累计事件数 |
| user_count | INTEGER | 影响用户数 |
| ai_summary | TEXT | AI 一句话摘要 |
| metadata | JSONB | 扩展（如环境分布快照） |

**events**（按月分区，分区键 timestamp）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| project_id | UUID | 所属项目 |
| issue_id | UUID | 关联 Issue（错误事件） |
| type | ENUM | error / blank_screen / api_error / performance |
| timestamp | TIMESTAMP | 事件时间 |
| session_id | VARCHAR(64) | 会话 ID |
| user_id | VARCHAR(64) | 用户标识 |
| page_url | VARCHAR(500) | 页面 URL |
| app_version | VARCHAR(20) | 应用版本 |
| environment | VARCHAR(20) | 环境 |
| device | JSONB | 设备信息 |
| data | JSONB | 事件数据 |
| breadcrumbs | JSONB | ⭐ 行为轨迹 |
| request_context | JSONB | 关联接口请求 |

**ai_analyses**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| issue_id | UUID | 关联 Issue |
| type | ENUM | summary / analysis / fix_direction |
| result | JSONB | 分析结果 |
| model_used | VARCHAR(50) | 模型标识 |
| created_at | TIMESTAMP | 生成时间 |
| expires_at | TIMESTAMP | 缓存过期 |

**performance_aggregations**

| 字段 | 类型 | 说明 |
|------|------|------|
| project_id | UUID | 项目 |
| page_url | VARCHAR(500) | 页面 |
| period | ENUM | minute / hour / day |
| period_start | TIMESTAMP | 周期起始 |
| fcp_p50 / p75 / p95 | FLOAT | FCP 分位值 |
| lcp_p50 / p75 / p95 | FLOAT | LCP 分位值 |
| cls_p50 / p75 / p95 | FLOAT | CLS 分位值 |
| sample_count | INTEGER | 样本数 |

**alert_rules** / **alert_history**（结构同 v2，此处省略）


---

## 五、API 接口设计

### 5.1 数据上报

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/v1/report` | API Key | SDK 批量上报 |
| POST | `/api/v1/sourcemap` | API Key | SourceMap 上传 |

### 5.2 Issue 与错误

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/projects/:id/issues` | Issue 列表（分页 + 筛选 + 排序） |
| GET | `/api/v1/issues/:id` | Issue 详情（含 AI 摘要、环境分布） |
| PATCH | `/api/v1/issues/:id/status` | 更新状态 |
| GET | `/api/v1/issues/:id/events` | 该 Issue 的事件列表 |
| GET | `/api/v1/issues/:id/events/:eid` | 单事件详情（含完整 breadcrumbs + 接口记录） |
| GET | `/api/v1/issues/:id/trend` | Issue 趋势 |
| GET | `/api/v1/issues/:id/distribution` | 环境分布（浏览器/OS/版本） |
| GET | `/api/v1/issues/:id/compare-events` | 多事件路径对比数据 |

### 5.3 性能

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/projects/:id/performance/overview` | Web Vitals 概览 |
| GET | `/api/v1/projects/:id/performance/pages` | 页面排行 |
| GET | `/api/v1/projects/:id/performance/trend` | 趋势 |

### 5.4 AI 分析

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/issues/:id/ai/analyze` | 触发上下文分析 |
| GET | `/api/v1/issues/:id/ai/result` | 获取分析结果 |
| GET | `/api/v1/projects/:id/ai/daily-report` | AI 日报 |

### 5.5 告警

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/v1/projects/:id/alerts/rules` | 告警规则 CRUD |
| PATCH | `/api/v1/alerts/rules/:id` | 更新规则 |
| GET | `/api/v1/projects/:id/alerts/history` | 告警历史 |

### 5.6 项目与认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/login` | 登录（简化方案） |
| GET | `/api/v1/projects` | 项目列表 |
| POST | `/api/v1/projects` | 创建项目（返回 API Key） |
| GET | `/api/v1/projects/:id` | 项目详情 |
| PATCH | `/api/v1/projects/:id/settings` | 更新项目设置 |

---

## 六、非功能性需求

### 6.1 性能

| 指标 | 目标 |
|------|------|
| SDK 体积 | 核心 gzip < 10KB，全量 < 15KB |
| SDK 性能影响 | 主线程占用 < 1% |
| 上报接口 P99 | < 50ms |
| 数据可见延迟 | < 30s |
| Dashboard 首屏 | < 2s |
| 上报并发 | 单实例 > 2000 QPS |

### 6.2 可用性

- 上报接口可用性 > 99.9%
- SDK 内部错误不影响宿主应用
- 后端无状态，支持水平扩展
- 上报失败自动降级本地缓存

### 6.3 安全

- HTTPS 通信
- API Key 验证上报身份
- 内置数据脱敏（URL 敏感参数、输入内容不采集）
- `beforeSend` 钩子支持自定义脱敏
- 输入校验防注入

### 6.4 可扩展性

- SDK 插件化，可自定义采集插件
- AI 模块可插拔，可整体禁用
- 告警渠道可扩展
- LLM Provider 可切换
- 存储层可替换

---

## 七、项目结构

```
rewind/
├── packages/
│   ├── shared/                     # 共享类型定义（SDK ↔ Server ↔ Dashboard）
│   │   ├── src/types/
│   │   └── package.json
│   │
│   ├── sdk/                        # 前端 SDK
│   │   ├── src/
│   │   │   ├── core/               # 核心引擎（生命周期、事件总线）
│   │   │   ├── plugins/
│   │   │   │   ├── error.ts        # 错误捕获
│   │   │   │   ├── blank-screen.ts # 白屏检测 ⭐
│   │   │   │   ├── api.ts          # 接口监控
│   │   │   │   ├── performance.ts  # 性能采集
│   │   │   │   └── behavior.ts     # 行为录制
│   │   │   ├── breadcrumb/         # 面包屑管理（环形缓冲区）
│   │   │   ├── transport/          # 上报传输层
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── server/                     # 后端服务 (NestJS)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── ingestion/      # 数据接收 & 限流
│   │   │   │   ├── processing/     # 数据处理管线
│   │   │   │   ├── issue/          # Issue 管理
│   │   │   │   ├── event/          # 事件查询 & 行为回放
│   │   │   │   ├── performance/    # 性能分析
│   │   │   │   ├── alert/          # 告警引擎
│   │   │   │   ├── ai/            # AI 分析（可插拔）
│   │   │   │   ├── project/       # 项目管理
│   │   │   │   └── sourcemap/     # SourceMap
│   │   │   ├── common/
│   │   │   ├── config/
│   │   │   └── main.ts
│   │   ├── prisma/schema.prisma
│   │   └── package.json
│   │
│   └── dashboard/                  # 可视化平台 (React)
│       ├── src/
│       │   ├── pages/
│       │   │   ├── Dashboard/
│       │   │   ├── Issues/
│       │   │   ├── IssueDetail/    # 问题定位工作台 ⭐
│       │   │   ├── Performance/
│       │   │   ├── AIInsights/
│       │   │   └── Settings/
│       │   ├── components/
│       │   │   ├── BreadcrumbTimeline/  # 行为时间线 ⭐
│       │   │   ├── StackTrace/
│       │   │   ├── EventCompare/        # 事件对比 ⭐
│       │   │   ├── EnvDistribution/     # 环境分布 ⭐
│       │   │   └── ...
│       │   ├── hooks/
│       │   ├── store/              # Redux Toolkit
│       │   ├── services/
│       │   └── App.tsx
│       └── package.json
│
├── docs/
├── docker-compose.yml
├── turbo.json                  # Turborepo 任务编排
├── pnpm-workspace.yaml
└── package.json
```

---

## 八、开发里程碑

| 阶段 | 周期 | 交付内容 | 核心目标 |
|------|------|----------|----------|
| **P0-a 采集基础** | 第 1-2 周 | Monorepo 搭建、SDK 核心引擎 + 错误捕获 + 行为录制 + 上报机制、后端数据接收 + 存储 | 数据能采上来、存下去 |
| **P0-b 问题定位** | 第 3-5 周 | 错误指纹归并、SourceMap 还原、**问题定位工作台**（堆栈 + 行为时间线 + 接口关联 + 环境差异 + 事件对比）、Issue 列表与管理 | **核心体验：能定位问题** |
| **P0-c 白屏与接口** | 第 5-6 周 | 白屏检测、接口监控、接口异常作为独立 Issue 类型 | 覆盖最高频问题类型 |
| **P1 AI 增强** | 第 7-8 周 | AI 错误摘要（自动）、上下文整理与线索分析（手动触发）、修复方向建议 | 降低人工分析成本 |
| **P1 告警** | 第 8-9 周 | 告警规则引擎、异常检测（统计规则）、通知渠道（Webhook + 邮件） | 被动查看 → 主动通知 |
| **P2 性能与完善** | 第 9-10 周 | 性能采集与分析页、AI 日报、Dashboard 总览页、渲染优化、文档 | 完整可交付产品 |

---

## 九、技术风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| 行为录制数据量大 | 上报体积、存储成本 | 环形缓冲区限制条数 + 仅随错误上报 + 数据压缩 |
| 高并发上报数据丢失 | 数据完整性 | BullMQ 缓冲 + Redis 限流 + 批量写入 |
| SourceMap 解析慢 | 定位延迟 | 异步解析 + 结果缓存 + Worker 线程 |
| 事件数据量大查询慢 | Dashboard 响应 | 按月分区 + 预聚合 + 查询缓存 + 数据保留策略 |
| AI 调用成本与延迟 | 体验/成本 | 结果缓存 + 异步 + 每日上限 + 可降级 |
| 白屏检测误报 | 用户信任度 | 双重检测（FCP 超时 + DOM 采样）降低误报率 |
| XHR/Fetch 劫持兼容性 | 跨端场景 | 明确支持范围（标准浏览器环境），非标准环境提供手动上报 API |

---

## 十、验收标准

### 核心验收（P0 — 问题定位闭环）

1. ✅ 错误发生时，SDK 自动关联最近 30 条操作轨迹 + 接口记录并上报
2. ✅ 问题定位工作台可展示：源码级堆栈 + 行为时间线 + 关联接口 + 环境差异
3. ✅ 同类错误自动归并为 Issue，指纹准确率 > 95%
4. ✅ 白屏事件可被自动检测并上报
5. ✅ 同一 Issue 的多个事件可切换查看并对比操作路径

### AI 验收（P1）

6. ✅ AI 可对 Issue 生成一句话摘要
7. ✅ AI 可整理错误上下文并给出可能原因与修复方向

### 告警验收（P1）

8. ✅ 告警规则触发后 1 分钟内发送通知
9. ✅ Issue 回归（resolved → regressed）自动触发告警

### 基础验收

10. ✅ SDK 通过 `npm install` 安装，一行代码接入
11. ✅ 数据采集到 Dashboard 可见 < 30s
12. ✅ SDK gzip < 15KB，对宿主 Lighthouse 评分影响 < 2 分
13. ✅ Dashboard 在 10 万条数据量级下操作流畅
