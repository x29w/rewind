/**
 * API 相关类型定义
 * API Related Type Definitions
 * API関連タイプ定義
 * API 相關類型定義
 */

declare namespace API {
  /**
   * 通用 API 响应接口
   * @description_zh API 响应的通用结构
   * @description_en Generic structure for API responses
   * @description_ja APIレスポンスの汎用構造
   * @description_tw API 回應的通用結構
   */
  interface Response<T = any> {
    data: T;
    meta?: {
      timestamp?: number;
      page?: number;
      pageSize?: number;
      total?: number;
      totalPages?: number;
    };
  }

  /**
   * API 错误接口
   * @description_zh API 错误响应结构
   * @description_en API error response structure
   * @description_ja APIエラーレスポンス構造
   * @description_tw API 錯誤回應結構
   */
  interface Error {
    error: {
      code: string;
      message: string;
      details?: any[];
    };
  }
}