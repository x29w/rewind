/**
 * 告警配置路由
 * Alert Configuration Route
 * アラート設定ルート
 * 告警配置路由
 */

import { createFileRoute } from '@tanstack/react-router';
import { AlertConfigPage } from '../pages/AlertConfigPage';

export const Route = createFileRoute('/alerts')({
  component: AlertConfigPage,
});
