/**
 * 当前项目装饰器
 * Current Project Decorator
 * 現在のプロジェクトデコレーター
 * 目前專案裝飾器
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 获取当前项目
 * Get Current Project
 * 現在のプロジェクトを取得
 * 取得目前專案
 *
 * @description_zh 从请求对象中提取当前项目信息（由 ApiKeyGuard 注入）
 * @description_en Extract current project from request object (injected by ApiKeyGuard)
 * @description_ja リクエストオブジェクトから現在のプロジェクトを抽出（ApiKeyGuard によって注入）
 * @description_tw 從請求物件中提取目前專案資訊（由 ApiKeyGuard 注入）
 */
export const CurrentProject = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.project;
  },
);
