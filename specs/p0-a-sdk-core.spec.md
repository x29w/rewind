---
title: P0-a SDK 核心引擎开发
status: pending
priority: high
assignee: agent
estimatedDays: 3
tags: [sdk, core, plugin-system]
dependencies: [p0-a-monorepo-setup]
---

# P0-a SDK 核心引擎开发

## 📋 目标

实现 SDK 的核心引擎，包括 Client 主类、插件管理系统、配置管理、事件总线，以及错误捕获和行为录制两个核心插件。

## 🎯 验收标准

- [ ] Client 单例模式实现，提供 init/captureError/addBreadcrumb 等公开 API
- [ ] PluginManager 支持插件注册、初始化、卸载
- [ ] BreadcrumbManager 环形缓冲区正常工作
- [ ] Error 插件可以捕获 JS 错误、Promise 错误、资源错误
- [ ] Behavior 插件可以记录点击、路由、输入、可见性变化
- [ ] 所有功能有单元测试，覆盖率 > 80%
- [ ] SDK 打包后 gzip < 10KB

## 📦 任务列表

### Task 1: 实现 Client 主类
**状态**: pending  
**预估**: 1 天

**子任务**:
- [ ] 创建 `src/core/client.ts`
- [ ] 实现单例模式
- [ ] 实现配置管理（Config 类）
- [ ] 实现公开 API
  - [ ] `init(config: SDKConfig): void`
  - [ ] `captureError(error: Error, context?: Record<string, any>): void`
  - [ ] `addBreadcrumb(crumb: Partial<Breadcrumb>): void`
  - [ ] `setUser(user: { id: string; [key: string]: any }): void`
- [ ] 实现内部方法
  - [ ] `pushEvent(event: SDKEvent): void`
  - [ ] `getBreadcrumbs(): Breadcrumb[]`
  - [ ] `getConfig(): ResolvedConfig`
- [ ] 添加多语言注释（中英日文）
- [ ] 编写单元测试

**类型定义**:
```typescript
// src/core/types/index.d.ts
declare namespace SDK {
  /**
   * SDK 配置接口
   * SDK Configuration Interface
   * SDK設定インターフェース
   * SDK 配置接口
   */
  interface Config {
    /** DSN 地址 / DSN URL / DSN URL / DSN 地址 */
    dsn: string;
    /** 应用 ID / App ID / アプリID / 應用 ID */
    appId: string;
    /** 应用版本 / App Version / アプリバージョン / 應用版本 */
    appVersion: string;
    // ... 其他配置
  }
}
```

---

### Task 2: 实现 PluginManager
**状态**: pending  
**预估**: 0.5 天

**子任务**:
- [ ] 创建 `src/core/plugin-manager.ts`
- [ ] 定义 Plugin 接口
- [ ] 实现插件注册 `register(plugin: Plugin): void`
- [ ] 实现插件初始化 `setupAll(client: Client): void`
- [ ] 实现插件卸载 `teardownAll(): void`
- [ ] 添加插件生命周期管理
- [ ] 添加多语言注释
- [ ] 编写单元测试

**Plugin 接口**:
```typescript
declare namespace SDK {
  /**
   * 插件接口
   * Plugin Interface
   * プラグインインターフェース
   * 插件接口
   */
  interface Plugin {
    /** 插件名称 / Plugin name / プラグイン名 / 插件名稱 */
    name: string;
    /** 初始化方法 / Setup method / セットアップメソッド / 初始化方法 */
    setup(client: Client): void;
    /** 清理方法（可选）/ Teardown method (optional) / クリーンアップメソッド（オプション）/ 清理方法（可選）*/
    teardown?(): void;
  }
}
```

---

### Task 3: 实现 EventBus（可选）
**状态**: pending  
**预估**: 0.5 天

**子任务**:
- [ ] 创建 `src/core/event-bus.ts`
- [ ] 实现发布/订阅模式
- [ ] 实现 `on(event: string, handler: Function): void`
- [ ] 实现 `emit(event: string, data: any): void`
- [ ] 实现 `off(event: string, handler: Function): void`
- [ ] 添加多语言注释
- [ ] 编写单元测试

**注**: EventBus 用于插件间通信，如果插件间无需通信可跳过。

---

### Task 4: 实现 BreadcrumbManager
**状态**: pending  
**预估**: 0.5 天

**子任务**:
- [ ] 创建 `src/breadcrumb/manager.ts`
- [ ] 实现环形缓冲区（固定大小数组）
- [ ] 实现 `push(crumb: Breadcrumb): void`
- [ ] 实现 `snapshot(): Breadcrumb[]`（返回按时间排序的快照）
- [ ] 实现 `clear(): void`
- [ ] 添加多语言注释
- [ ] 编写单元测试（重点测试环形覆盖逻辑）

**测试用例**:
```typescript
it('should maintain fixed size buffer', () => {
  const manager = new BreadcrumbManager(3);
  manager.push({ type: 'click', message: '1', timestamp: 1 });
  manager.push({ type: 'click', message: '2', timestamp: 2 });
  manager.push({ type: 'click', message: '3', timestamp: 3 });
  manager.push({ type: 'click', message: '4', timestamp: 4 });
  
  const snapshot = manager.snapshot();
  expect(snapshot).toHaveLength(3);
  expect(snapshot[0].message).toBe('2'); // 最旧的被覆盖
});
```

---

### Task 5: 实现 Error 插件
**状态**: pending  
**预估**: 1 天

**子任务**:
- [ ] 创建 `src/plugins/error.ts`
- [ ] 实现 `window.onerror` 劫持
- [ ] 实现 `unhandledrejection` 监听
- [ ] 实现资源加载错误捕获（捕获阶段 error 事件）
- [ ] 构建错误事件数据结构
- [ ] 自动附加 breadcrumbs 和 requestContext
- [ ] 实现 safeExecute 包装器（防止 SDK 错误影响宿主）
- [ ] 添加多语言注释
- [ ] 编写单元测试

**错误事件结构**:
```typescript
interface ErrorEvent {
  type: 'error' | 'unhandled_rejection' | 'resource_error';
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  breadcrumbs: Breadcrumb[];
  requestContext: RequestRecord[];
  timestamp: number;
}
```

---

### Task 6: 实现 Behavior 插件
**状态**: pending  
**预估**: 1 天

**子任务**:
- [ ] 创建 `src/plugins/behavior.ts`
- [ ] 实现点击事件监听
  - [ ] 使用事件代理（document.addEventListener('click')）
  - [ ] 提取元素路径（tag#id.class）
  - [ ] 提取元素文本（截断 50 字）
- [ ] 实现路由变化监听
  - [ ] 劫持 pushState/replaceState
  - [ ] 监听 popstate 事件
- [ ] 实现输入事件监听（节流 500ms）
  - [ ] 只记录输入长度，不记录内容（隐私保护）
- [ ] 实现可见性变化监听
  - [ ] 监听 visibilitychange 事件
- [ ] 所有行为写入 BreadcrumbManager
- [ ] 添加多语言注释
- [ ] 编写单元测试

**DOM 工具函数**:
```typescript
// src/utils/dom.ts
/**
 * 获取元素路径
 * Get element path
 * 要素パスを取得
 * 獲取元素路徑
 */
function getElementPath(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const cls = el.className ? '.' + String(el.className).trim().split(/\s+/).slice(0, 2).join('.') : '';
  return `${tag}${id}${cls}`;
}
```

---

### Task 7: 实现工具函数
**状态**: pending  
**预估**: 0.5 天

**子任务**:
- [ ] 创建 `src/utils/uuid.ts`（生成 sessionId）
- [ ] 创建 `src/utils/safe.ts`（safeExecute 包装器）
- [ ] 创建 `src/utils/dom.ts`（DOM 相关工具）
- [ ] 创建 `src/utils/url.ts`（URL 脱敏）
- [ ] 所有工具函数添加多语言注释
- [ ] 编写单元测试

---

### Task 8: 配置 Rollup 打包
**状态**: pending  
**预估**: 0.5 天

**子任务**:
- [ ] 创建 `rollup.config.js`
- [ ] 配置 UMD 输出
- [ ] 配置 ESM 输出
- [ ] 配置 TypeScript 插件
- [ ] 配置 Terser 压缩
- [ ] 配置 SourceMap 生成
- [ ] 测试打包产物
- [ ] 验证体积（gzip < 10KB）

**Rollup 配置**:
```javascript
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'src/index.ts',
    output: { file: 'dist/rewind.esm.js', format: 'es', sourcemap: true },
    plugins: [nodeResolve(), typescript(), terser()],
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/rewind.umd.js', format: 'umd', name: 'Rewind', sourcemap: true },
    plugins: [nodeResolve(), typescript(), terser()],
  },
];
```

---

## 🔍 验证步骤

```bash
# 1. 运行测试
cd packages/sdk
pnpm test
# 预期：所有测试通过，覆盖率 > 80%

# 2. 构建
pnpm build
# 预期：生成 dist/rewind.esm.js 和 dist/rewind.umd.js

# 3. 检查体积
ls -lh dist/
gzip -c dist/rewind.umd.js | wc -c
# 预期：gzip 后 < 10KB

# 4. 手动测试
# 创建 test.html，引入 SDK，触发错误，查看控制台
```

---

## 📝 注意事项

1. **零依赖**: 不引入任何第三方运行时库
2. **错误隔离**: 所有可能抛错的代码用 try-catch 包裹
3. **类型安全**: 所有公开 API 有完整类型定义
4. **多语言注释**: 所有公开函数、类、接口必须有中英日文注释
5. **命名规范**: 文件名使用 kebab-case

---

## 🔗 相关文档

- [SDK 设计文档](../docs/design/01-SDK设计.md)
- [开发规范](../docs/development/rules.md)
