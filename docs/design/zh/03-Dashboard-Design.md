# @rewind-dev/dashboard — 可视化平台设计文档

> 基于 PRD v3.0 | 日期：2026-04-29

---

## 一、应用概述

| 属性 | 说明 |
|------|------|
| 包名 | `@rewind-dev/dashboard` |
| 技术栈 | React 18 + TypeScript + Vite + Ant Design 5 + ECharts + Redux Toolkit + TanStack Router + TanStack Query |
| 产物 | 静态文件（HTML/JS/CSS） |
| 部署 | Nginx / 任意静态托管 |
| 职责 | 数据可视化、问题定位工作台、AI 分析交互、告警配置 |

---

## 二、目录结构

```
packages/dashboard/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── router.tsx                    # TanStack Router 路由树
│   ├── routeTree.gen.ts             # TanStack Router 自动生成的路由树
│   │
│   ├── layouts/
│   │   └── AppLayout.tsx             # 主布局（侧边栏 + 顶栏 + 内容区）
│   │
│   ├── pages/
│   │   ├── Login/
│   │   │   └── index.tsx
│   │   ├── Dashboard/                # 项目总览
│   │   │   ├── index.tsx
│   │   │   ├── HealthScore.tsx       # 健康度评分卡
│   │   │   ├── MetricCards.tsx       # 核心指标卡片
│   │   │   └── ErrorTrend.tsx        # 错误趋势图
│   │   ├── Issues/                   # Issue 列表
│   │   │   ├── index.tsx
│   │   │   ├── IssueTable.tsx        # Issue 表格
│   │   │   └── IssueFilters.tsx      # 筛选器
│   │   ├── IssueDetail/              # ⭐ 问题定位工作台
│   │   │   ├── index.tsx             # 页面编排
│   │   │   ├── IssueHeader.tsx       # 标题 + 状态 + 摘要
│   │   │   ├── EventSelector.tsx     # 事件切换器
│   │   │   ├── StackTracePanel.tsx   # 堆栈面板
│   │   │   ├── BreadcrumbPanel.tsx   # 行为时间线面板
│   │   │   ├── EnvPanel.tsx          # 环境差异面板
│   │   │   ├── AIPanel.tsx           # AI 分析面板
│   │   │   ├── TrendPanel.tsx        # 趋势面板
│   │   │   └── CompareView.tsx       # 事件对比视图
│   │   ├── Performance/              # 性能分析
│   │   │   ├── index.tsx
│   │   │   ├── VitalsOverview.tsx
│   │   │   ├── SlowPages.tsx
│   │   │   └── TrendCompare.tsx
│   │   ├── AIInsights/               # AI 洞察
│   │   │   ├── index.tsx
│   │   │   ├── SummaryList.tsx
│   │   │   └── DailyReport.tsx
│   │   └── Settings/                 # 项目设置
│   │       ├── index.tsx
│   │       ├── ProjectInfo.tsx
│   │       ├── SDKGuide.tsx          # 接入指引
│   │       ├── AlertRules.tsx        # 告警规则配置
│   │       ├── SourcemapList.tsx     # SourceMap 管理
│   │       └── AlertHistory.tsx      # 告警历史
│   │
│   ├── components/                   # 通用组件
│   │   ├── BreadcrumbTimeline/       # ⭐ 行为时间线
│   │   │   ├── index.tsx
│   │   │   ├── TimelineItem.tsx
│   │   │   └── icons.tsx
│   │   ├── StackTrace/               # ⭐ 源码级堆栈
│   │   │   ├── index.tsx
│   │   │   ├── FrameItem.tsx
│   │   │   └── SourceSnippet.tsx
│   │   ├── EventCompare/             # ⭐ 事件对比
│   │   │   ├── index.tsx
│   │   │   └── PathDiff.tsx
│   │   ├── EnvDistribution/          # ⭐ 环境分布
│   │   │   ├── index.tsx
│   │   │   └── AnomalyTag.tsx
│   │   ├── TrendChart/               # 趋势折线图
│   │   ├── StatusTag/                # Issue 状态标签
│   │   ├── ErrorTypeIcon/            # 错误类型图标
│   │   └── EmptyState/               # 空状态
│   │
│   ├── hooks/                        # 自定义 Hooks
│   │   ├── useIssues.ts
│   │   ├── useIssueDetail.ts
│   │   ├── useIssueEvents.ts
│   │   ├── useAIAnalysis.ts
│   │   ├── usePerformance.ts
│   │   └── useAlerts.ts
│   │
│   ├── store/                        # Redux Toolkit 状态
│   │   ├── index.ts                 # configureStore + 根 reducer
│   │   ├── hooks.ts                 # useAppSelector / useAppDispatch
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── projectSlice.ts
│   │       └── issueFilterSlice.ts
│   │
│   ├── services/                     # API 请求层
│   │   ├── api.ts                    # Axios 实例 + 拦截器
│   │   ├── issue.api.ts
│   │   ├── event.api.ts
│   │   ├── ai.api.ts
│   │   ├── performance.api.ts
│   │   ├── alert.api.ts
│   │   ├── project.api.ts
│   │   └── auth.api.ts
│   │
│   ├── utils/
│   │   ├── date.ts                   # 日期格式化
│   │   ├── number.ts                 # 数字格式化（千分位等）
│   │   └── color.ts                  # 状态颜色映射
│   │
│   └── styles/
│       └── global.css
│
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 三、路由设计（TanStack Router）

TanStack Router 采用文件路由 + 类型安全的方式，路由参数和 search params 都有完整的 TypeScript 类型推导。

### 3.1 路由文件结构

```
src/routes/
├── __root.tsx                    # 根路由（全局 Provider）
├── login.tsx                     # /login
├── _authenticated.tsx            # 认证布局（AuthGuard + AppLayout）
├── _authenticated/
│   ├── dashboard.tsx             # /dashboard
│   ├── issues.tsx                # /issues（列表）
│   ├── issues.$issueId.tsx       # /issues/$issueId（问题定位工作台）
│   ├── performance.tsx           # /performance
│   ├── ai-insights.tsx           # /ai-insights
│   ├── settings.tsx              # /settings（项目信息）
│   ├── settings.alerts.tsx       # /settings/alerts
│   ├── settings.alerts.history.tsx  # /settings/alerts/history
│   └── settings.sourcemap.tsx    # /settings/sourcemap
```

### 3.2 路由定义

```typescript
// routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Outlet />
      </Provider>
    </QueryClientProvider>
  ),
});

// routes/_authenticated.tsx
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    const token = store.getState().auth.token;
    if (!token) {
      throw redirect({ to: '/login' });
    }
  },
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

// routes/_authenticated/issues.$issueId.tsx — 问题定位工作台
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/issues/$issueId')({
  // 类型安全的路由参数
  parseParams: (params) => ({ issueId: params.issueId }),
  // 路由级数据预加载
  loader: ({ params }) =>
    queryClient.ensureQueryData({
      queryKey: ['issue', 'detail', params.issueId],
      queryFn: () => issueApi.detail(params.issueId).then(r => r.data),
    }),
  component: IssueDetailPage,
});

// routes/_authenticated/issues.tsx — Issue 列表
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

// 类型安全的 search params（筛选条件持久化到 URL）
const issueSearchSchema = z.object({
  status: z.array(z.enum(['open', 'resolved', 'ignored', 'regressed'])).optional(),
  timeRange: z.string().optional().default('last24h'),
  environment: z.string().optional(),
  type: z.string().optional(),
  sortBy: z.enum(['eventCount', 'userCount', 'lastSeen']).optional().default('lastSeen'),
  page: z.number().optional().default(1),
});

export const Route = createFileRoute('/_authenticated/issues')({
  validateSearch: issueSearchSchema,
  component: IssuesPage,
});
```

### 3.3 路由入口

```typescript
// router.tsx
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',  // hover 时预加载
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// main.tsx
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />,
);
```

**TanStack Router 带来的优势**：
- **类型安全**：路由参数 `$issueId`、search params 都有完整 TS 类型，拼错参数名编译期就能发现
- **Search Params 持久化**：Issue 列表的筛选条件自动同步到 URL，刷新不丢失、可分享链接
- **路由级数据预加载**：`loader` 在导航前预加载数据，减少页面白屏时间
- **文件路由**：目录结构即路由结构，不需要手动维护路由配置

**侧边栏菜单**：

```
📊 项目总览        /dashboard
🐛 错误管理        /issues
📈 性能分析        /performance
🤖 AI 洞察         /ai-insights
⚙️ 设置
   ├── 项目信息    /settings
   ├── 告警规则    /settings/alerts
   └── SourceMap   /settings/sourcemap
```

---

## 四、状态管理（Redux Toolkit）

### 4.1 Store 配置

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { projectSlice } from './slices/projectSlice';
import { issueFilterSlice } from './slices/issueFilterSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    project: projectSlice.reducer,
    issueFilter: issueFilterSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```typescript
// store/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

### 4.2 Slices

```typescript
// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  user: { id: string; name: string; email: string } | null;
}

// 从 localStorage 恢复
const persisted = JSON.parse(localStorage.getItem('rewind-auth') || 'null');

const initialState: AuthState = {
  token: persisted?.token || null,
  user: persisted?.user || null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ token: string; user: AuthState['user'] }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('rewind-auth', JSON.stringify(action.payload));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('rewind-auth');
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
```

```typescript
// store/slices/projectSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectState {
  currentProject: Project | null;
}

export const projectSlice = createSlice({
  name: 'project',
  initialState: { currentProject: null } as ProjectState,
  reducers: {
    setCurrentProject(state, action: PayloadAction<Project>) {
      state.currentProject = action.payload;
    },
  },
});

export const { setCurrentProject } = projectSlice.actions;
```

```typescript
// store/slices/issueFilterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IssueFilterState {
  timeRange: string;
  status: string[];
  environment: string;
  appVersion: string;
  browser: string;
  os: string;
  type: string;
  pageUrl: string;
  sortBy: 'eventCount' | 'userCount' | 'lastSeen';
  sortOrder: 'asc' | 'desc';
}

const initialState: IssueFilterState = {
  timeRange: 'last24h',
  status: ['open', 'regressed'],
  environment: '',
  appVersion: '',
  browser: '',
  os: '',
  type: '',
  pageUrl: '',
  sortBy: 'lastSeen',
  sortOrder: 'desc',
};

export const issueFilterSlice = createSlice({
  name: 'issueFilter',
  initialState,
  reducers: {
    setFilter<K extends keyof IssueFilterState>(
      state: IssueFilterState,
      action: PayloadAction<{ key: K; value: IssueFilterState[K] }>,
    ) {
      (state as any)[action.payload.key] = action.payload.value;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const { setFilter, resetFilters } = issueFilterSlice.actions;
```

> **说明**：Issue 列表的筛选条件同时存在于 Redux（组件间共享）和 TanStack Router 的 search params（URL 持久化）中。页面初始化时从 URL search params 同步到 Redux，筛选变更时双向同步。

### 4.3 TanStack Query 配置

```typescript
// main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30s 内数据视为新鲜
      gcTime: 5 * 60_000,       // 5 分钟后垃圾回收
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

> **职责划分**：Redux Toolkit 管理客户端状态（认证、当前项目、筛选条件），TanStack Query 管理服务端状态（Issue 列表、事件详情、性能数据等所有 API 数据）。两者不重叠。

---

## 五、API 请求层

```typescript
// services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 15000,
});

// 请求拦截：注入 JWT
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截：401 跳转登录
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      // TanStack Router 导航到登录页
      router.navigate({ to: '/login' });
    }
    return Promise.reject(error);
  },
);
```

```typescript
// services/issue.api.ts
export const issueApi = {
  list: (projectId: string, params: IssueListParams) =>
    api.get<PageResult<IssueVO>>(`/api/v1/projects/${projectId}/issues`, { params }),

  detail: (issueId: string) =>
    api.get<IssueDetailVO>(`/api/v1/issues/${issueId}`),

  updateStatus: (issueId: string, status: IssueStatus) =>
    api.patch(`/api/v1/issues/${issueId}/status`, { status }),

  trend: (issueId: string, params: { period: string }) =>
    api.get<TrendData[]>(`/api/v1/issues/${issueId}/trend`, { params }),

  distribution: (issueId: string) =>
    api.get<DistributionData>(`/api/v1/issues/${issueId}/distribution`),

  compareEvents: (issueId: string, eventIds: string[]) =>
    api.get(`/api/v1/issues/${issueId}/compare-events`, { params: { ids: eventIds.join(',') } }),
};

// hooks/useIssueDetail.ts
export function useIssueDetail(issueId: string) {
  return useQuery({
    queryKey: ['issue', 'detail', issueId],
    queryFn: () => issueApi.detail(issueId).then(r => r.data),
  });
}

export function useIssueEvents(issueId: string, page: number) {
  return useQuery({
    queryKey: ['issue', 'events', issueId, page],
    queryFn: () => eventApi.listByIssue(issueId, { page, pageSize: 20 }).then(r => r.data),
    placeholderData: keepPreviousData,
  });
}

export function useAIAnalyze(issueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => aiApi.analyze(issueId).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', 'detail', issueId] });
    },
  });
}
```

---

## 六、核心组件设计

### 6.1 BreadcrumbTimeline — 行为时间线 ⭐

```typescript
interface BreadcrumbTimelineProps {
  breadcrumbs: Breadcrumb[];
  errorTimestamp: number;
  highlightApiErrors?: boolean;  // 默认 true
}

// 组件结构
function BreadcrumbTimeline({ breadcrumbs, errorTimestamp }: Props) {
  return (
    <div className="breadcrumb-timeline">
      {breadcrumbs.map((crumb, index) => (
        <TimelineItem
          key={index}
          icon={ICON_MAP[crumb.type]}
          message={crumb.message}
          timestamp={crumb.timestamp}
          relativeTime={formatRelative(crumb.timestamp, errorTimestamp)} // "错误前 3s"
          level={crumb.level}
          isApiError={crumb.type === 'api' && crumb.level === 'error'}
          detail={crumb.data}
          expandable={crumb.type === 'api'}  // 接口类型可展开详情
        />
      ))}
      {/* 最后一条：错误本身 */}
      <TimelineItem
        icon={<BugIcon />}
        message="错误发生"
        timestamp={errorTimestamp}
        level="error"
        isLast
      />
    </div>
  );
}

// 图标映射
const ICON_MAP = {
  click: '👆',
  route: '🔗',
  input: '⌨️',
  api: '🌐',
  visibility: '👁',
  scroll: '📜',
  console: '📋',
  custom: '🏷',
};
```

### 6.2 StackTrace — 源码级堆栈 ⭐

```typescript
interface StackTraceProps {
  frames: ResolvedFrame[];
}

interface ResolvedFrame {
  functionName: string;
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  isResolved: boolean;
  sourceSnippet?: {
    lines: Array<{ number: number; content: string }>;
    highlightLine: number;
  };
}

// 组件结构
function StackTrace({ frames }: Props) {
  return (
    <div className="stack-trace">
      {frames.map((frame, i) => (
        <FrameItem key={i} frame={frame} defaultExpanded={i === 0}>
          {frame.sourceSnippet && (
            <SourceSnippet
              lines={frame.sourceSnippet.lines}
              highlightLine={frame.sourceSnippet.highlightLine}
            />
          )}
        </FrameItem>
      ))}
    </div>
  );
}

// SourceSnippet：代码片段展示
// - 行号 + 代码内容
// - 错误行红色背景高亮
// - 等宽字体，保持缩进
```

### 6.3 EnvDistribution — 环境差异分析 ⭐

```typescript
interface EnvDistributionProps {
  distribution: {
    browsers: Record<string, number>;
    os: Record<string, number>;
    versions: Record<string, number>;
  };
}

// 核心逻辑：检测异常偏高的维度
function detectAnomaly(dist: Record<string, number>): AnomalyInfo[] {
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  const anomalies: AnomalyInfo[] = [];

  for (const [key, count] of Object.entries(dist)) {
    const ratio = count / total;
    // 如果某个维度占比 > 60%，标记为异常
    if (ratio > 0.6 && Object.keys(dist).length > 1) {
      anomalies.push({
        dimension: key,
        ratio,
        message: `${key} 占比 ${(ratio * 100).toFixed(0)}%，可能是特定环境问题`,
      });
    }
  }

  return anomalies;
}

// 展示：水平柱状图 + 异常标签 ⚠️
```

### 6.4 EventCompare — 事件对比 ⭐

```typescript
interface EventCompareProps {
  events: Array<{
    id: string;
    device: DeviceInfo;
    breadcrumbs: Breadcrumb[];
  }>;
}

// 核心逻辑：找出共同操作步骤
function findCommonSteps(events: EventCompareProps['events']): number[][] {
  // 对比多个事件的 breadcrumbs
  // 相同 type + 相似 message（编辑距离 < 阈值）视为共同步骤
  // 返回每个事件中共同步骤的索引
}

// 展示：
// - 并排 2-3 列，每列一个事件的行为时间线
// - 共同步骤用绿色背景高亮 + 连线
// - 顶部显示每个事件的设备信息
```

---

## 七、页面设计

### 7.1 问题定位工作台（IssueDetail）⭐ 核心页面

```typescript
function IssueDetailPage() {
  const { issueId } = Route.useParams();  // TanStack Router 类型安全参数
  const { data: issue } = useIssueDetail(issueId);
  const { data: events } = useIssueEvents(issueId, 1);
  const [selectedEventId, setSelectedEventId] = useState<string>();
  const [view, setView] = useState<'detail' | 'compare'>('detail');

  const selectedEvent = events?.find(e => e.id === selectedEventId) || events?.[0];

  return (
    <div className="issue-detail">
      {/* 顶部：Issue 标题 + 状态 + AI 摘要 + 统计 */}
      <IssueHeader issue={issue} />

      {/* 事件选择器 + 视图切换（详情/对比） */}
      <EventSelector
        events={events}
        selected={selectedEventId}
        onSelect={setSelectedEventId}
        view={view}
        onViewChange={setView}
      />

      {view === 'detail' ? (
        <>
          {/* 源码级堆栈 */}
          <StackTracePanel frames={selectedEvent?.resolvedStack} />

          {/* ⭐ 行为时间线 */}
          <BreadcrumbPanel
            breadcrumbs={selectedEvent?.breadcrumbs}
            errorTimestamp={selectedEvent?.timestamp}
          />

          {/* 环境差异 */}
          <EnvPanel issueId={issueId} />

          {/* AI 分析 */}
          <AIPanel issueId={issueId} />

          {/* 趋势 */}
          <TrendPanel issueId={issueId} />
        </>
      ) : (
        /* 事件对比视图 */
        <CompareView issueId={issueId} />
      )}
    </div>
  );
}
```

### 7.2 Issue 列表页

- AntD Table + 虚拟滚动（`virtual` 属性）
- 左侧筛选面板（时间/状态/环境/版本/类型）
- 支持批量选择 → 批量 resolve / ignore
- 点击行跳转到问题定位工作台

### 7.3 Dashboard 总览页

- 健康度评分卡（0-100，绿/黄/红）
- 4 个核心指标卡片（错误数、新 Issue、白屏、LCP P75）
- 错误趋势折线图（ECharts）
- 最近告警列表
- 问题热点 Top 10

### 7.4 性能分析页

- Web Vitals 仪表盘（5 个指标的 P50/P75/P95）
- 慢页面排行表格
- 趋势对比（选择两个时间段）

---

## 八、渲染优化策略

| 策略 | 实现方式 | 应用场景 |
|------|----------|----------|
| 虚拟滚动 | AntD Table `virtual` 属性 | Issue 列表、事件列表 |
| 图表降采样 | ECharts `sampling: 'lttb'` | 大时间跨度趋势图 |
| Web Worker | `new Worker()` 处理聚合计算 | 环境分布统计 |
| React Query 缓存 | `staleTime: 30s` | 所有查询接口 |
| 骨架屏 | AntD Skeleton | 页面首次加载 |
| 分页 + 无限滚动 | `useInfiniteQuery` | 事件列表 |
| 代码分割 | `React.lazy` + `Suspense` | 按路由分割 |

---

## 九、Dashboard 任务清单

| 编号 | 任务 | 预估 | 阶段 |
|------|------|------|------|
| FE-01 | Vite + React 项目初始化 + AntD + TanStack Router + Redux Toolkit | 1d | P0-a |
| FE-02 | AppLayout 主布局（侧边栏+顶栏+内容区） | 1d | P0-a |
| FE-03 | Redux store + slices + API 请求层 + Axios 拦截器 | 1d | P0-a |
| FE-04 | 登录页 | 0.5d | P0-a |
| FE-05 | Issue 列表页（表格+筛选+排序+状态管理） | 2d | P0-b |
| FE-06 | StackTrace 组件（帧列表+源码片段展开） | 2d | P0-b |
| FE-07 | BreadcrumbTimeline 组件（时间线+图标+展开详情） | 2.5d | P0-b |
| FE-08 | EnvDistribution 组件（分布图+异常检测标签） | 1.5d | P0-b |
| FE-09 | EventCompare 组件（并排对比+共同步骤高亮） | 2d | P0-b |
| FE-10 | IssueDetail 页面整合（布局+事件切换+各面板） | 2d | P0-b |
| FE-11 | Issue 列表支持白屏/接口异常类型 | 0.5d | P0-c |
| FE-12 | 工作台适配白屏/接口异常展示 | 1d | P0-c |
| FE-13 | AIPanel 组件（触发分析+轮询结果+展示） | 2d | P1 |
| FE-14 | AI 洞察页（摘要列表+日报查看） | 1.5d | P1 |
| FE-15 | 告警规则配置页（表单+列表） | 1.5d | P1 |
| FE-16 | 告警历史列表 | 1d | P1 |
| FE-17 | 性能分析页（Vitals+慢页面+趋势对比） | 2.5d | P2 |
| FE-18 | Dashboard 总览页（健康度+指标+趋势+热点） | 2d | P2 |
| FE-19 | 设置页（项目信息+接入指引+SourceMap 管理） | 1.5d | P2 |
| FE-20 | 渲染优化（虚拟滚动+降采样+代码分割） | 2d | P2 |
