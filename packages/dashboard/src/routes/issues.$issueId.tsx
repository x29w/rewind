/**
 * 问题详情路由
 * Issue Detail Route
 * 問題詳細ルート
 * 問題詳情路由
 */

import { createFileRoute } from '@tanstack/react-router';
import { IssueDetailPage } from '../pages/IssueDetailPage';

export const Route = createFileRoute('/issues/$issueId')({
  component: IssueDetailPage,
});
