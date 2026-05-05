/**
 * 当前用户装饰器
 * Current User Decorator
 * 現在のユーザーデコレーター
 * 目前使用者裝飾器
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 获取当前用户
 * Get Current User
 * 現在のユーザーを取得
 * 取得目前使用者
 *
 * @description_zh 从请求对象中提取当前用户信息（由 JwtAuthGuard 注入）
 * @description_en Extract current user from request object (injected by JwtAuthGuard)
 * @description_ja リクエストオブジェクトから現在のユーザーを抽出（JwtAuthGuard によって注入）
 * @description_tw 從請求物件中提取目前使用者資訊（由 JwtAuthGuard 注入）
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
