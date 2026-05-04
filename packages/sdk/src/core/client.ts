/**
 * SDK 客户端核心
 * SDK Client Core
 * SDK クライアントコア
 * SDK 客戶端核心
 */

import type { Config, Client } from './types/index.d';
import type { Rewind } from '@rewind-dev/shared';

/**
 * 全局客户端实例
 * Global client instance
 * グローバルクライアントインスタンス
 * 全域客戶端實例
 */
let clientInstance: Client | null = null;

/**
 * 初始化 SDK
 * Initialize SDK
 * SDK を初期化
 * 初始化 SDK
 * 
 * @param config - 配置对象 / Configuration object / 設定オブジェクト / 配置物件
 */
export const init = (config: Config): Client => {
  if (clientInstance) {
    console.warn('[Rewind SDK] Already initialized');
    return clientInstance;
  }
  
  // TODO: Implement full client initialization
  const client: Client = {
    config,
    captureError: (error: Error, extra?: Record<string, any>) => {
      console.log('[Rewind SDK] captureError:', error, extra);
    },
    addBreadcrumb: (breadcrumb: Rewind.Breadcrumb) => {
      console.log('[Rewind SDK] addBreadcrumb:', breadcrumb);
    },
    sendEvent: (event: Rewind.SDKEvent) => {
      console.log('[Rewind SDK] sendEvent:', event);
    }
  };
  
  clientInstance = client;
  
  if (config.debug) {
    console.log('[Rewind SDK] Initialized with config:', config);
  }
  
  return client;
};

/**
 * 捕获错误
 * Capture error
 * エラーをキャプチャ
 * 捕獲錯誤
 */
export const captureError = (error: Error, extra?: Record<string, any>): void => {
  if (!clientInstance) {
    console.warn('[Rewind SDK] Not initialized. Call init() first.');
    return;
  }
  
  clientInstance.captureError(error, extra);
};

/**
 * 添加面包屑
 * Add breadcrumb
 * ブレッドクラムを追加
 * 添加麵包屑
 */
export const addBreadcrumb = (breadcrumb: Rewind.Breadcrumb): void => {
  if (!clientInstance) {
    console.warn('[Rewind SDK] Not initialized. Call init() first.');
    return;
  }
  
  clientInstance.addBreadcrumb(breadcrumb);
};
