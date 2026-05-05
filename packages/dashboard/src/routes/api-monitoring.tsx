/**
 * API 监控路由
 * API Monitoring Route
 * API モニタリングルート
 * API 監控路由
 */

import { createFileRoute } from '@tanstack/react-router';
import { ApiMonitoringPage } from '../pages/api-monitoring-page';

export const Route = createFileRoute('/api-monitoring')({
  component: ApiMonitoringPage,
});
