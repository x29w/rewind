/**
 * AI 分析路由
 * AI Analysis Route
 * AI 分析ルート
 * AI 分析路由
 */

import { createFileRoute } from '@tanstack/react-router';
import { AiAnalysisPage } from '../pages/AiAnalysisPage';

export const Route = createFileRoute('/ai-analysis')({
  component: AiAnalysisPage,
});
