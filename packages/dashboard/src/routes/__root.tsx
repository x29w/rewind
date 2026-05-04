/**
 * 根路由
 * Root Route
 * ルートルート
 * 根路由
 */

import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { Layout } from 'antd';
import type { QueryClient } from '@tanstack/react-query';

const { Header, Content } = Layout;

/**
 * 根路由组件
 * Root Route Component
 * ルートルートコンポーネント
 * 根路由元件
 */
const RootComponent = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ color: 'white', fontSize: '20px' }}>
        Rewind Dashboard
      </Header>
      <Content style={{ padding: '24px' }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
});
