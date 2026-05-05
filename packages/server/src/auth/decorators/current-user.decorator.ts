/**
 * 当前用户装饰器
 * Current User Decorator
 * 現在のユーザーデコレーター
 * 目前使用者裝飾器
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
