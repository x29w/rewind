/**
 * 白屏检测路由
 * Blank Screen Detection Route
 * ブランクスクリーン検出ルート
 * 白屏檢測路由
 */

import { createFileRoute } from '@tanstack/react-router';
import { BlankScreenPage } from '../pages/BlankScreenPage';

export const Route = createFileRoute('/blank-screen')({
  component: BlankScreenPage,
});
