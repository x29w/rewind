---
title: P0-a Dashboard 基础架构
status: pending
priority: high
assignee: agent
estimatedDays: 2
tags: [dashboard, react, routing]
dependencies: [p0-a-monorepo-setup]
---

# P0-a Dashboard 基础架构

## 📋 目标

搭建 Dashboard 的基础架构，包括 React + Vite 项目初始化、TanStack Router 配置、Redux Toolkit 状态管理、Ant Design UI 库集成，以及基础布局。

## 🎯 验收标准

- [ ] Vite 开发服务器可以正常启动
- [ ] TanStack Router 文件路由配置完成
- [ ] Redux Toolkit store 配置完成
- [ ] Ant Design 主题配置完成
- [ ] 基础布局（侧边栏 + 顶栏 + 内容区）完成
- [ ] 登录页和认证流程完成
- [ ] API 请求层配置完成（Axios + 拦截器）

## 📦 任务列表

### Task 1: Vite + React 项目初始化
**状态**: pending  
**预估**: 0.5 天

**子任务**:
- [ ] 使用 Vite 创建 React + TypeScript 项目
- [ ] 配置 package.json（引用 @rewind-dev/shared）
- [ ] 配置 tsconfig.json
- [ ] 配置 vite.config.ts
- [ ] 安装核心依赖
- [ ] 创建基础目录结构
- [ ] 测试开发服务器启动

**核心依赖**:
```json
{
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "antd": "^5.21.0",
  "@reduxjs/toolkit": "^2.0.0",
  "react-redux": "^9.0.0",
  "@tanstack/react-router": "^1.0.0",
  "@tanstack/react-query": "^5.0.0",
  "axios": "^1.7.0",
  "echarts": "^5.5.0",
  "echarts-for-react": "^3.0.0"
}
```

**目录结构**:
```
packages/dashboard/
├── src/
│   ├── routes/          # TanStack Router 路由
│   ├── layouts/         # 布局组件
│   ├── pages/           # 页面组件
│   ├── components/      # 通用组件
│   ├── store/           # Redux store
│   ├── services/        # API 服务
│   ├── hooks/           # 自定义 hooks
│   ├── utils/           # 工具函数
│   ├── styles/          # 全局样式
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
└── vite.config.ts
```

---

### Task 2: 配置 TanStack Router
**状态**: pending  
**预估**: 1 天

**子任务**:
- [ ] 安装 TanStack Router 依赖
- [ ] 创建 src/routes/ 目录
- [ ] 创建根路由 __root.tsx
- [ ] 创建认证布局路由 _authenticated.tsx
- [ ] 创建登录路由 login.tsx
- [ ] 创建 Dashboard 路由 _authenticated/dashboard.tsx
- [ ] 配置路由生成（routeTree.gen.ts）
- [ ] 创建 router.tsx
- [ ] 在 main.tsx 中集成 RouterProvider
- [ ] 测试路由跳转

**根路由**:
```typescript
// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { queryClient } from '@/services/query-client';

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Outlet />
      </Provider>
    </QueryClientProvider>
  ),
});
```

**认证布局**:
```typescript
// src/routes/_authenticated.tsx
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { AppLayout } from '@/layouts/app-layout';

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
```

---

### Task 3: 配置 Redux Toolkit
**状态**: pending  
**预估**: 0.5 天

**子任务**:
- [ ] 创建 src/store/ 目录
- [ ] 创建 store/index.ts（configureStore）
- [ ] 创建 store/hooks.ts（useAppDispatch, useAppSelector）
- [ ] 创建 store/slices/auth-slice.ts
- [ ] 创建 store/slices/project-slice.ts
- [ ] 实现 localStorage 持久化（auth）
- [ ] 测试 store 功能

**AuthSlice**:
```typescript
// src/store/slices/auth-slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * 认证状态接口
 * Auth state interface
 * 認証状態インターフェース
 * 認證狀態接口
 */
interface AuthState {
  /** Token / Token / トークン / Token */
  token: string | null;
  /** 用户信息 / User info / ユーザー情報 / 用戶信息 */
  user: { id: string; name: string; email: string } | null;
}

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

---

### Task 4: 配置 API 请求层
**状态**: pending  
**预估**: 0.5 天

**子任务**:
- [ ] 创建 src/services/ 目录
- [ ] 创建 services/api.ts（Axios 实例）
- [ ] 配置请求拦截器（注入 JWT）
- [ ] 配置响应拦截器（401 跳转登录）
- [ ] 创建 services/auth.api.ts
- [ ] 创建 services/query-client.ts（TanStack Query）
- [ ] 测试 API 请求

**Axios 配置**:
```typescript
// src/services/api.ts
import axios from 'axios';
import { store } from '@/store';
import { logout } from '@/store/slices/auth-slice';
import { router } from '@/router';

/**
 * API 客户端实例
 * API client instance
 * APIクライアントインスタンス
 * API 客戶端實例
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 15000,
});

// 请求拦截：注入 JWT
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截：401 跳转登录
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      router.navigate({ to: '/login' });
    }
    return Promise.reject(error);
  },
);
```

---

### Task 5: 创建 AppLayout
**状态**: pending  
**预估**: 1 天

**子任务**:
- [ ] 创建 src/layouts/app-layout/ 目录
- [ ] 创建 app-layout/index.tsx（主布局）
- [ ] 创建 app-layout/sidebar.tsx（侧边栏）
- [ ] 创建 app-layout/header.tsx（顶栏）
- [ ] 使用 Ant Design Layout 组件
- [ ] 实现侧边栏菜单（项目总览/错误管理/性能分析/设置）
- [ ] 实现顶栏（用户信息/退出登录）
- [ ] 实现响应式布局
- [ ] 添加多语言注释

**AppLayout 结构**:
```typescript
// src/layouts/app-layout/index.tsx
import { Layout } from 'antd';
import { Sidebar } from './sidebar';
import { Header } from './header';

/**
 * 应用主布局
 * App main layout
 * アプリメインレイアウト
 * 應用主佈局
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header />
        <Layout.Content style={{ padding: 24 }}>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
```

**侧边栏菜单**:
```typescript
const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '项目总览' },
  { key: '/issues', icon: <BugOutlined />, label: '错误管理' },
  { key: '/performance', icon: <LineChartOutlined />, label: '性能分析' },
  { key: '/settings', icon: <SettingOutlined />, label: '设置' },
];
```

---

### Task 6: 创建登录页
**状态**: pending  
**预估**: 0.5 天

**子任务**:
- [ ] 创建 src/pages/login/ 目录
- [ ] 创建 login/index.tsx
- [ ] 使用 Ant Design Form 组件
- [ ] 实现登录表单（用户名/密码）
- [ ] 实现登录逻辑（调用 API）
- [ ] 登录成功后跳转到 Dashboard
- [ ] 添加表单验证
- [ ] 添加加载状态

**登录页面**:
```typescript
// src/pages/login/index.tsx
/**
 * 登录页面
 * Login page
 * ログインページ
 * 登錄頁面
 */
export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { data } = await authApi.login(values);
      dispatch(setAuth(data));
      navigate({ to: '/dashboard' });
    } catch (error) {
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card title="Rewind 登录" style={{ width: 400 }}>
        <Form onFinish={handleSubmit}>
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="邮箱" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
```

---

### Task 7: 创建 Dashboard 页面（占位）
**状态**: pending  
**预估**: 0.5 天

**子任务**:
- [ ] 创建 src/pages/dashboard/ 目录
- [ ] 创建 dashboard/index.tsx
- [ ] 创建简单的欢迎页面
- [ ] 添加"开发中"提示
- [ ] 测试路由跳转

---

## 🔍 验证步骤

```bash
# 1. 启动开发服务器
cd packages/dashboard
pnpm dev
# 预期：服务启动在 5173 端口

# 2. 访问登录页
open http://localhost:5173/login
# 预期：显示登录表单

# 3. 测试登录（需要 server 运行）
# 输入用户名密码，点击登录
# 预期：跳转到 /dashboard

# 4. 测试侧边栏
# 点击各个菜单项
# 预期：路由正常跳转

# 5. 测试退出登录
# 点击顶栏的退出按钮
# 预期：跳转回登录页
```

---

## 📝 注意事项

1. **禁止不必要的 useEffect**: 使用 TanStack Query 管理服务端状态
2. **禁止不必要的 useCallback**: 只在确实需要时使用
3. **Redux 只存数据**: 不在 Redux 中写业务逻辑
4. **组件命名**: 使用 PascalCase
5. **文件命名**: 使用 kebab-case

---

## 🔗 相关文档

- [Dashboard 设计文档](../docs/design/03-Dashboard设计.md)
- [开发规范](../docs/development/rules.md)
