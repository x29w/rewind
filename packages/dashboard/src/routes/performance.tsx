/**
 * 性能分析路由
 * Performance Analysis Route
 * パフォーマンス分析ルート
 * 效能分析路由
 */

import { createFileRoute } from '@tanstack/react-router';
import { PerformancePage } from '../pages';

export const Route = createFileRoute('/performance')({
  component: PerformancePage,
});
