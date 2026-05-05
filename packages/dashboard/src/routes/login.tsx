/**
 * 登录路由
 * Login Route
 * ログインルート
 * 登入路由
 */

import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '../pages/login-page';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});
