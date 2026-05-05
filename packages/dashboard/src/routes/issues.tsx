/**
 * 问题列表路由
 * Issues Route
 * 問題一覧ルート
 * 問題列表路由
 */

import { createFileRoute } from '@tanstack/react-router';
import { IssueListPage } from '../pages/IssueListPage';

export const Route = createFileRoute('/issues')({
  component: IssueListPage,
});
