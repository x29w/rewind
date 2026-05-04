/**
 * SDK 核心类型定义
 * SDK Core Type Definitions
 * SDK コアタイプ定義
 * SDK 核心類型定義
 */

import type { Rewind } from '@rewind-dev/shared';

declare namespace SDK {
  /**
   * SDK 配置接口
   * SDK Configuration Interface
   * SDK 設定インターフェース
   * SDK 配置介面
   */
  interface Config {
    /** DSN 地址 / DSN URL / DSN URL / DSN 地址 */
    dsn: string;
    
    /** 应用 ID / App ID / アプリ ID / 應用 ID */
    appId: string;
    
    /** 应用版本 / App version / アプリバージョン / 應用版本 */
    appVersion: string;
    
    /** 环境 / Environment / 環境 / 環境 */
    environment?: string;
    
    /** 采样率 (0-1) / Sample rate (0-1) / サンプリングレート (0-1) / 採樣率 (0-1) */
    sampleRate?: number;
    
    /** 面包屑最大数量 / Max breadcrumbs / 最大ブレッドクラム数 / 麵包屑最大數量 */
    maxBreadcrumbs?: number;
    
    /** 是否启用 / Enabled / 有効 / 是否啟用 */
    enabled?: boolean;
    
    /** 调试模式 / Debug mode / デバッグモード / 除錯模式 */
    debug?: boolean;
    
    /** 用户信息 / User info / ユーザー情報 / 用戶資訊 */
    user?: {
      id?: string;
      email?: string;
      username?: string;
    };
    
    /** 标签 / Tags / タグ / 標籤 */
    tags?: Record<string, string>;
    
    /** 插件配置 / Plugin config / プラグイン設定 / 外掛配置 */
    plugins?: PluginConfig[];
  }
  
  /**
   * 插件配置
   * Plugin Configuration
   * プラグイン設定
   * 外掛配置
   */
  interface PluginConfig {
    /** 插件名称 / Plugin name / プラグイン名 / 外掛名稱 */
    name: string;
    
    /** 是否启用 / Enabled / 有効 / 是否啟用 */
    enabled?: boolean;
    
    /** 插件选项 / Plugin options / プラグインオプション / 外掛選項 */
    options?: Record<string, any>;
  }
  
  /**
   * 插件接口
   * Plugin Interface
   * プラグインインターフェース
   * 外掛介面
   */
  interface Plugin {
    /** 插件名称 / Plugin name / プラグイン名 / 外掛名稱 */
    name: string;
    
    /**
     * 设置插件
     * Setup plugin
     * プラグインをセットアップ
     * 設置外掛
     */
    setup: (client: Client) => void;
    
    /**
     * 清理插件
     * Teardown plugin
     * プラグインをクリーンアップ
     * 清理外掛
     */
    teardown?: () => void;
  }
  
  /**
   * 客户端接口
   * Client Interface
   * クライアントインターフェース
   * 客戶端介面
   */
  interface Client {
    /** 配置 / Config / 設定 / 配置 */
    config: Config;
    
    /**
     * 捕获错误
     * Capture error
     * エラーをキャプチャ
     * 捕獲錯誤
     */
    captureError: (error: Error, extra?: Record<string, any>) => void;
    
    /**
     * 添加面包屑
     * Add breadcrumb
     * ブレッドクラムを追加
     * 添加麵包屑
     */
    addBreadcrumb: (breadcrumb: Rewind.Breadcrumb) => void;
    
    /**
     * 发送事件
     * Send event
     * イベントを送信
     * 發送事件
     */
    sendEvent: (event: Rewind.SDKEvent) => void;
  }
}

export = SDK;
export as namespace SDK;
