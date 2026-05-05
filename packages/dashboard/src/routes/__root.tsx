/**
 * 根路由
 * Root Route
 * ルートルート
 * 根路由
 */

import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { AppLayout } from '../components/layout/AppLayout';
import type { QueryClient } from '@tanstack/react-query';

/**
 * 根路由组件
 * Root Route Component
 * ルートルートコンポーネント
 * 根路由元件
 */
const RootComponent = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
});
