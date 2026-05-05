/**
 * 项目列表路由
 * Projects Route
 * プロジェクト一覧ルート
 * 專案列表路由
 */

import { createFileRoute } from '@tanstack/react-router';
import { ProjectListPage } from '../pages/project-list-page';

export const Route = createFileRoute('/projects')({
  component: ProjectListPage,
});
