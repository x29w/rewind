/**
 * Server 配置类型定义
 * Server Configuration Type Definitions
 * Server 設定タイプ定義
 * Server 配置類型定義
 */

declare namespace Config {
  /**
   * 数据库配置
   * @description_zh 数据库连接配置参数
   * @description_en Database connection configuration parameters
   * @description_ja データベース接続設定パラメータ
   * @description_tw 資料庫連線配置參數
   */
  interface Database {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl?: boolean;
  }

  /**
   * Redis 配置
   * @description_zh Redis 连接配置参数
   * @description_en Redis connection configuration parameters
   * @description_ja Redis接続設定パラメータ
   * @description_tw Redis 連線配置參數
   */
  interface Redis {
    host: string;
    port: number;
    password?: string;
    db?: number;
  }

  /**
   * JWT 配置
   * @description_zh JWT 令牌配置参数
   * @description_en JWT token configuration parameters
   * @description_ja JWTトークン設定パラメータ
   * @description_tw JWT 令牌配置參數
   */
  interface JWT {
    secret: string;
    expiresIn: string;
  }

  /**
   * OpenAI 配置
   * @description_zh OpenAI API 配置参数
   * @description_en OpenAI API configuration parameters
   * @description_ja OpenAI API設定パラメータ
   * @description_tw OpenAI API 配置參數
   */
  interface OpenAI {
    apiKey: string;
    model?: string;
    maxTokens?: number;
  }

  /**
   * SMTP 配置
   * @description_zh SMTP 邮件服务配置参数
   * @description_en SMTP email service configuration parameters
   * @description_ja SMTPメールサービス設定パラメータ
   * @description_tw SMTP 郵件服務配置參數
   */
  interface SMTP {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  }
}