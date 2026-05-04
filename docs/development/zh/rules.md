# Rewind 开发规范文档

> 版本：v2.0 | 日期：2026-04-29

---

## 目录

- [一、通用规则](#一通用规则)
- [二、SDK 开发规范](#二sdk-开发规范)
- [三、Server 开发规范](#三server-开发规范)
- [四、Dashboard 开发规范](#四dashboard-开发规范)
- [五、Git 工作流](#五git-工作流)
- [六、代码审查清单](#六代码审查清单)

---

## 一、通用规则

### 1.0 开发流程

#### 测试驱动开发
- **每个阶段完成后必须测试通过才算成功完成**
- 所有新功能必须有对应的测试用例
- 修复 Bug 时必须先写测试用例重现问题
- 测试覆盖率要求：核心功能 > 80%，整体 > 60%

#### 测试类型
- **单元测试**：测试独立函数和类的功能
- **集成测试**：测试模块间的交互
- **E2E 测试**：测试完整的用户流程（Dashboard 和 Server）

#### 测试通过标准
- ✅ 所有测试用例通过
- ✅ 无 TypeScript 类型错误
- ✅ 无 Biome lint 错误
- ✅ 构建成功
- ✅ 手动验证核心功能正常

### 1.1 代码质量工具

#### Biome 配置
- **整个项目使用 Biome 作为统一的代码质量工具**
- Biome 替代 ESLint + Prettier，提供更快的 linting 和格式化
- 所有代码提交前必须通过 Biome 检查
- 使用 Biome 的推荐配置，根据项目需求微调

#### Biome 使用规则
- 提交前运行 `pnpm lint` 检查代码
- 使用 `pnpm format` 格式化代码
- 配置 Git hooks 自动运行 Biome 检查
- IDE 集成 Biome 插件实时检查

### 1.2 类型系统

#### 类型声明位置
- 所有类型都在各自模块下的 	ypes/index.d.ts 文件中声明
- 使用 declare namespace 组织类型，避免命名冲突
- 使用时采用 Namespace.Interface 或 Namespace.Type 的方式引用
- **禁止**单独创建 .ts 文件来声明类型
- **禁止**通过 import 导入类型（除了从 @rewind-dev/shared 导入共享类型）

#### 共享类型包
- 跨应用共享的类型定义在 @rewind-dev/shared 包中
- SDK 上报数据结构、Server API 响应结构、Dashboard 使用的 VO 类型都在 shared 中定义
- 各应用通过 workspace:* 协议引用 shared 包

**示例**：

\\\	ypescript
// ✅ 正确：在模块内声明 namespace
// packages/sdk/src/core/types/index.d.ts
declare namespace SDK {
  interface Config {
    dsn: string;
    appId: string;
    appVersion: string;
  }
  
  interface Event {
    type: string;
    timestamp: number;
    data: Record<string, any>;
  }
}

// 使用
const config: SDK.Config = { ... };

// ❌ 错误：单独的 .ts 文件
// types/config.ts
export interface Config { ... }
\\\

### 1.2 代码规范

#### 导入规则
- **禁止**使用动态 import() 导入任何模块
- 所有依赖必须在文件顶部静态导入
- 例外：Dashboard 中的路由懒加载可以使用 React.lazy()

#### 异步处理
- **禁止**使用 setTimeout、setInterval 等延迟手段来处理业务逻辑
- 异步操作使用 Promise、sync/await
- 需要延迟的场景（如防抖节流）使用专门的工具函数

#### 错误处理
- SDK 中所有可能抛出错误的代码必须用 	ry-catch 包裹
- SDK 内部错误绝不能影响宿主应用，使用 safeExecute 包装器
- Server 使用 NestJS 的全局异常过滤器统一处理
- Dashboard 使用 Error Boundary 捕获组件错误

### 1.3 目录结构

#### 命名规范
- 文件夹和文件名统一使用 **kebab-case**（小写字母 + 连字符）
- 示例：error-handler.ts、readcrumb-manager.ts、issue-detail/
- React 组件文件夹内的主组件命名为 index.tsx

#### Utils 分类
所有应用的 utils/ 目录按职责分为三类：

| 目录 | 职责 | 示例 |
|------|------|------|
| utils/common/ | 通用工具函数，与业务无关，可跨项目复用 | uuid.ts、date.ts、url.ts |
| utils/feature/ | 业务相关工具函数，项目内多处使用 | ingerprint.ts、stack-parser.ts |
| utils/config/ | 项目基建配置相关 | env.ts、constants.ts |

### 1.4 注释规范

#### 注释要求
- **所有**公开的函数、类、接口、类型必须有 JSDoc 注释
- 注释必须包含：简体中文、繁体中文、英文、日文四种语言
- 类型字段也需要注释说明用途

**示例**：

\\\	ypescript
/**
 * 计算错误指纹
 * 計算錯誤指紋
 * Calculate error fingerprint
 * エラーフィンガープリントを計算する
 * 
 * @param event - 错误事件 / 錯誤事件 / Error event / エラーイベント
 * @returns 指纹哈希值 / 指紋哈希值 / Fingerprint hash / フィンガープリントハッシュ
 */
function computeFingerprint(event: SDK.Event): string {
  // ...
}

declare namespace SDK {
  interface Event {
    /** 事件类型 / 事件類型 / Event type / イベントタイプ */
    type: string;
    /** 时间戳 / 時間戳 / Timestamp / タイムスタンプ */
    timestamp: number;
  }
}
\\\

### 1.5 性能要求

#### 体积控制
- SDK 核心包 gzip < 10KB，全量 < 15KB
- Dashboard 首屏 JS < 500KB（gzip）
- 单个组件文件 < 300 行（超过需拆分）

#### 运行时性能
- SDK 对宿主应用性能影响 < 1%
- Dashboard 列表渲染使用虚拟滚动（数据 > 100 条）
- 避免不必要的重渲染，合理使用 React.memo

---

### 1.6 代码清理

#### 未使用代码检测
- **必须**定期检查并删除未使用的变量、函数、文件、文件夹
- 使用 ESLint 的 `no-unused-vars` 规则检测未使用的变量
- 使用工具（如 `unimported`、`depcheck`）检测未使用的依赖和文件
- 每次 PR 前必须清理未使用的代码

#### 清理原则
- 未使用的变量：立即删除
- 未使用的函数/类：确认无外部引用后删除
- 未使用的文件：确认无 import 引用后删除
- 未使用的文件夹：确认内部所有文件都未使用后删除
- 未使用的依赖：从 package.json 中移除

#### 例外情况
- 公开 API（即使内部未使用，也可能被外部使用）
- 类型定义（可能被外部 TypeScript 项目引用）
- 配置文件（即使当前未使用，也可能在特定环境下使用）

**示例**：

```typescript
// ❌ 错误：未使用的变量
function processData(data: any[]) {
  const unusedVar = 'not used'; // 应删除
  const result = data.map(item => item.value);
  return result;
}

// ✅ 正确：清理后
function processData(data: any[]) {
  return data.map(item => item.value);
}

// ❌ 错误：未使用的导入
import { usedFunction, unusedFunction } from './utils'; // unusedFunction 应删除

// ✅ 正确：只导入使用的
import { usedFunction } from './utils';
```

---

### 1.7 函数声明
尽量都使用箭头函数

## 二、SDK 开发规范

### 2.1 架构原则

#### 插件化设计
- 核心引擎（Client + PluginManager）与插件分离
- 每个插件独立实现 Plugin 接口
- 插件可选加载，支持 Tree-shaking

#### 零依赖
- **禁止**引入任何第三方运行时依赖
- 所有功能自行实现或使用浏览器原生 API
- 开发依赖（Rollup、TypeScript 等）不受限制

#### 类型安全
- 完全的 TypeScript 类型支持
- 所有公开 API 必须有完整的类型定义
- 导出的类型供业务方使用

### 2.2 代码组织

#### 目录结构
\\\
packages/sdk/
├── src/
│   ├── core/           # 核心引擎
│   ├── plugins/        # 各功能插件
│   ├── breadcrumb/     # 面包屑管理
│   ├── transport/      # 上报传输
│   ├── utils/          # 工具函数
│   └── index.ts        # 公开 API
├── __tests__/          # 测试文件
└── rollup.config.js
\\\

#### 插件开发规范
- 每个插件一个文件，命名为功能名（如 error.ts、lank-screen.ts）
- 插件必须实现 setup() 和可选的 	eardown() 方法
- 插件内部错误必须被捕获，不能影响其他插件

### 2.3 测试要求

#### 测试覆盖
- 使用 Vitest 编写单元测试
- 核心功能测试覆盖率 > 80%
- 每个插件必须有独立的测试文件

#### 测试场景
- 正常流程测试
- 边界条件测试
- 错误处理测试
- 浏览器兼容性测试（使用 Playwright）

**示例**：

\\\	ypescript
// __tests__/breadcrumb-manager.test.ts
import { describe, it, expect } from 'vitest';
import { BreadcrumbManager } from '../src/breadcrumb/manager';

describe('BreadcrumbManager', () => {
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
});
\\\

### 2.4 打包发布

#### Rollup 配置
- 输出 UMD 和 ESM 两种格式
- 启用 Tree-shaking
- 生成 SourceMap
- 使用 Terser 压缩

#### 版本管理
- 遵循语义化版本（Semver）
- Breaking changes 升级主版本号
- 新功能升级次版本号
- Bug 修复升级修订号

---

## 三、Server 开发规范

### 3.1 NestJS 架构

#### 模块划分
- 按业务领域划分模块（Ingestion、Processing、Issue、Event 等）
- 每个模块独立的 Module、Controller、Service
- 共享逻辑抽取到 Common 模块

#### 依赖注入
- 使用 NestJS 的 DI 系统
- Service 通过构造函数注入依赖
- 避免循环依赖

### 3.2 数据库规范

#### ORM 使用
- 使用 Prisma 作为 ORM
- Schema 定义在 prisma/schema.prisma
- 数据库选型：**PostgreSQL**（而非 MySQL）
  - 原因：需要 JSONB 类型存储 breadcrumbs、device 等复杂字段
  - 需要按月分区（Range Partitioning）
  - 需要更好的并发性能

#### 数据访问
- 复杂查询使用 Prisma 的类型安全 API
- 性能敏感的查询可以使用原生 SQL（\prisma.\）
- 事务操作使用 \prisma.\

### 3.3 测试规范

#### 测试策略
- **不需要** .spec.ts 文件（单元测试）
- 重点编写集成测试和 E2E 测试
- 使用 Supertest 测试 HTTP 接口

#### 测试数据
- 使用独立的测试数据库
- 每个测试用例前清理数据
- 使用 Factory 模式生成测试数据

### 3.4 API 设计

#### RESTful 规范
- 使用标准 HTTP 方法（GET、POST、PATCH、DELETE）
- 资源路径使用复数名词（/issues、/events）
- 嵌套资源不超过 2 层

#### 响应格式
\\\	ypescript
// 成功响应
{
  "data": { ... },
  "meta": { "timestamp": 1234567890 }
}

// 分页响应
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}

// 错误响应
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Validation failed",
    "details": [ ... ]
  }
}
\\\

### 3.5 性能优化

#### 缓存策略
- 热数据使用 Redis 缓存（TTL 30s - 5min）
- SourceMap 解析结果缓存（LRU，1000 条）
- 聚合数据预计算

#### 队列处理
- 使用 BullMQ 异步处理耗时任务
- 批量消费（每批 100 条）
- 失败重试（最多 3 次）

---

## 四、Dashboard 开发规范

### 4.1 技术栈

#### 核心库版本
- React 18（或考虑 React 19）
- Ant Design 5（或考虑 Ant Design 6）
- TypeScript 5.5+
- Vite 6+

#### 状态管理
- Redux Toolkit：管理客户端状态（认证、筛选条件）
- TanStack Query：管理服务端状态（API 数据）
- **禁止**在 Redux 中写业务逻辑方法，只存储数据

### 4.2 组件开发

#### 组件分类
| 目录 | 职责 | 示例 |
|------|------|------|
| components/common/ | 通用 UI 组件，与业务无关 | Button、Modal、EmptyState |
| components/feature/ | 业务组件，项目特定 | BreadcrumbTimeline、StackTrace、EventCompare |
| components/config/ | 配置相关组件 | ThemeProvider、AuthGuard |

#### 组件结构
- Feature 组件必须是文件夹，主组件为 index.tsx
- 子组件放在同级目录下
- 组件相关的类型、样式、工具函数放在同一文件夹

**示例**：
\\\
components/feature/breadcrumb-timeline/
├── index.tsx           # 主组件
├── timeline-item.tsx   # 子组件
├── icons.tsx           # 图标
├── types.d.ts          # 类型定义
└── utils.ts            # 工具函数
\\\

### 4.3 React 最佳实践

#### Hooks 使用
- **禁止**写不必要的 useEffect 和 useCallback
- 遵循"谁触发谁调用谁改变值"的原则
- **禁止**写监听式的 useEffect（除非确实需要同步外部系统）

**示例**：

\\\	ypescript
// ❌ 错误：不必要的 useEffect
function IssueList() {
  const [filters, setFilters] = useState({});
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetchIssues(filters).then(setData);
  }, [filters]); // 监听 filters 变化
  
  return <div>...</div>;
}

// ✅ 正确：使用 TanStack Query
function IssueList() {
  const [filters, setFilters] = useState({});
  
  const { data } = useQuery({
    queryKey: ['issues', filters],
    queryFn: () => fetchIssues(filters),
  });
  
  return <div>...</div>;
}

// ❌ 错误：不必要的 useCallback
function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []); // 没有依赖，不需要 useCallback
  
  return <Child onClick={handleClick} />;
}

// ✅ 正确：直接定义
function Parent() {
  const handleClick = () => {
    console.log('clicked');
  };
  
  return <Child onClick={handleClick} />;
}
\\\

#### 性能优化
- 列表渲染使用 key（使用稳定的 ID，不用 index）
- 大列表使用虚拟滚动（Ant Design Table 的 irtual 属性）
- 避免在 render 中创建新对象/数组/函数（除非必要）
- 合理使用 React.memo（仅在确实有性能问题时）

### 4.4 路由管理

#### TanStack Router
- 使用文件路由（src/routes/ 目录）
- 路由参数和 search params 必须有类型定义
- 使用 loader 预加载数据

**示例**：

\\\	ypescript
// routes/_authenticated/issues..tsx
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/_authenticated/issues/')({
  parseParams: (params) => ({
    issueId: z.string().parse(params.issueId),
  }),
  loader: ({ params }) =>
    queryClient.ensureQueryData({
      queryKey: ['issue', params.issueId],
      queryFn: () => issueApi.detail(params.issueId),
    }),
  component: IssueDetailPage,
});
\\\

### 4.5 样式规范

#### CSS 方案
- 使用 CSS Modules 或 Tailwind CSS
- 避免全局样式污染
- 使用 Ant Design 的主题定制

#### 响应式设计
- 支持桌面端（1920x1080、1366x768）
- 移动端暂不支持（可在后续版本添加）

---

## 五、Git 工作流

### 5.1 分支策略

#### 主要分支
- main：生产环境代码，受保护
- develop：开发主分支
- eature/*：功能分支
- ugfix/*：Bug 修复分支
- hotfix/*：紧急修复分支

#### 分支命名
\\\
feature/sdk-error-capture
feature/dashboard-issue-detail
bugfix/server-fingerprint-collision
hotfix/sdk-memory-leak
\\\

### 5.2 提交规范

#### Commit Message 格式
遵循 Conventional Commits 规范：

\\\
<type>(<scope>): <subject>

<body>

<footer>
\\\

#### Type 类型
- eat: 新功能
- ix: Bug 修复
- docs: 文档更新
- style: 代码格式（不影响功能）
- 
efactor: 重构
- perf: 性能优化
- 	est: 测试相关
- chore: 构建/工具链相关

#### Scope 范围
- sdk: SDK 相关
- server: Server 相关
- dashboard: Dashboard 相关
- shared: 共享类型包
- docs: 文档
- ci: CI/CD

**示例**：

\\\
feat(sdk): add blank screen detection plugin

- Implement FCP timeout detection
- Add DOM sampling for confirmation
- Auto-attach breadcrumbs to blank screen events

Closes #42
\\\

### 5.3 Pull Request

#### PR 标题
- 与 Commit Message 格式一致
- 简洁明了，说明改动内容

#### PR 描述模板
\\\markdown
## 改动说明
简要描述本次改动的内容和目的

## 改动类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档更新
- [ ] 其他

## 测试
- [ ] 已添加单元测试
- [ ] 已添加集成测试
- [ ] 已手动测试

## 截图（如适用）
（粘贴截图）

## 相关 Issue
Closes #123
\\\

#### Code Review 要求
- 至少 1 人 Approve 才能合并
- 所有 CI 检查必须通过
- 解决所有 Review Comments

---

## 六、代码审查清单

### 6.1 通用检查项

- [ ] 代码符合项目规范（命名、格式、注释）
- [ ] 没有 console.log、debugger 等调试代码
- [ ] 没有硬编码的敏感信息（密钥、密码）
- [ ] 错误处理完善
- [ ] 类型定义完整
- [ ] 注释清晰（中英日文）

### 6.2 SDK 检查项

- [ ] 没有引入第三方运行时依赖
- [ ] 所有可能抛出错误的代码都有 try-catch
- [ ] 体积符合预算（gzip < 15KB）
- [ ] 有对应的单元测试
- [ ] 不影响宿主应用性能

### 6.3 Server 检查项

- [ ] API 接口有认证和权限检查
- [ ] 输入参数有校验（DTO + class-validator）
- [ ] 数据库查询有索引优化
- [ ] 敏感操作有日志记录
- [ ] 错误响应格式统一

### 6.4 Dashboard 检查项

- [ ] 没有不必要的 useEffect/useCallback
- [ ] 列表渲染有正确的 key
- [ ] 大列表使用虚拟滚动
- [ ] 加载状态和错误状态处理完善
- [ ] 响应式布局正常
- [ ] 无 TypeScript 类型错误

### 6.5 性能检查项

- [ ] 没有 N+1 查询问题
- [ ] 大数据量场景有分页或虚拟滚动
- [ ] 图片有压缩和懒加载
- [ ] 接口响应时间 < 500ms（P95）
- [ ] 首屏加载时间 < 2s

---

## 附录：常用命令

### Monorepo 命令

\\\ash
# 安装依赖
pnpm install

# 全量构建
pnpm build

# 开发模式
pnpm dev:server
pnpm dev:dashboard

# 只构建 SDK
pnpm build:sdk

# 运行测试
pnpm test

# 代码检查
pnpm lint

# 类型检查
pnpm type-check
\\\

### Git 命令

\\\ash
# 创建功能分支
git checkout -b feature/your-feature-name

# 提交代码
git add .
git commit -m "feat(scope): your commit message"

# 推送分支
git push origin feature/your-feature-name

# 更新主分支
git checkout develop
git pull origin develop

# 变基到最新
git checkout feature/your-feature-name
git rebase develop
\\\

---

**文档维护**：本规范文档由团队共同维护，如有改进建议请提 PR。
