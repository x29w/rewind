/**
 * Server 中间件类型定义
 * Server Middleware Type Definitions
 * Server ミドルウェアタイプ定義
 * Server 中介軟體類型定義
 */

declare namespace Middleware {
  /**
   * 认证守卫参数
   * @description_zh 认证守卫中间件需要的参数
   * @description_en Parameters required for authentication guard middleware
   * @description_ja 認証ガードミドルウェアに必要なパラメータ
   * @description_tw 認證守衛中介軟體需要的參數
   */
  interface AuthGuardParams {
    request: any;
    user?: Entity.User;
  }

  /**
   * 限流参数
   * @description_zh 限流中间件需要的参数
   * @description_en Parameters required for rate limiting middleware
   * @description_ja レート制限ミドルウェアに必要なパラメータ
   * @description_tw 限流中介軟體需要的參數
   */
  interface RateLimitParams {
    key: string;
    limit: number;
    window: number;
  }

  /**
   * API 密钥验证参数
   * @description_zh API 密钥验证守卫需要的参数
   * @description_en Parameters required for API key guard
   * @description_ja APIキー検証ガードに必要なパラメータ
   * @description_tw API 密鑰驗證守衛需要的參數
   */
  interface ApiKeyGuardParams {
    apiKey: string;
  }
}