/**
 * Dashboard 入口文件
 * Dashboard Entry Point
 * ダッシュボードエントリーポイント
 * 儀表板入口檔案
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { ConfigProvider } from 'antd';
import { store } from './store';
import { routeTree } from './routeTree.gen';
import './index.css';

// 创建 React Query 客户端
// Create React Query client
// React Query クライアントを作成
// 建立 React Query 客戶端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// 创建路由实例
// Create router instance
// ルーターインスタンスを作成
// 建立路由實例
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
});

// 类型声明
// Type declaration
// タイプ宣言
// 類型宣告
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#1890ff',
            },
          }}
        >
          <RouterProvider router={router} />
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
