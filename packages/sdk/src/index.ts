/**
 * SDK 主入口
 * SDK Main Entry
 * SDK メインエントリー
 * SDK 主入口
 */

export { Client } from './core/client';
export { PluginManager } from './core/plugin-manager';
export { BreadcrumbManager } from './core/breadcrumb-manager';
export { ErrorPlugin } from './plugins/error';
export { BehaviorPlugin } from './plugins/behavior';
export { BlankScreenPlugin } from './plugins/blank-screen';
export { ApiPlugin } from './plugins/api';

export type { SDK } from './core/types/index.d';

import { Client } from './core/client';
import { ErrorPlugin } from './plugins/error';
import { BehaviorPlugin } from './plugins/behavior';
import { BlankScreenPlugin } from './plugins/blank-screen';
import { ApiPlugin } from './plugins/api';

/**
 * 初始化 SDK
 * Initialize SDK
 * SDK を初期化
 * 初始化 SDK
 */
export const init = (options: SDK.InitOptions): SDK.Client => {
  const client = Client.getInstance(options);
  
  // 注册默认插件
  // Register default plugins
  // デフォルトプラグインを登録
  // 註冊預設外掛程式
  client.registerPlugin(new ErrorPlugin());
  client.registerPlugin(new BehaviorPlugin());
  
  if (options.enableBlankScreenDetection !== false) {
    client.registerPlugin(new BlankScreenPlugin());
  }
  
  if (options.enableApiMonitoring !== false) {
    client.registerPlugin(new ApiPlugin());
  }

  return client;
};

/**
 * 获取 SDK 实例
 * Get SDK instance
 * SDK インスタンスを取得
 * 取得 SDK 實例
 */
export const getClient = (): SDK.Client | null => {
  return Client.getInstance();
};
