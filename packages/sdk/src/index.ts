/**
 * Rewind SDK 主入口
 * Rewind SDK Main Entry
 * Rewind SDK メインエントリ
 * Rewind SDK 主入口
 */

export { Client } from './core/client';
export { BreadcrumbManager } from './core/breadcrumb-manager';
export { PluginManager } from './core/plugin-manager';
export { ErrorPlugin } from './plugins/error';
export { BehaviorPlugin } from './plugins/behavior';

export type { SDKConfig, ResolvedConfig, UserInfo } from './core/client';
export type { Plugin } from './core/plugin-manager';

// 工具函数导出
// Utility function exports
// ユーティリティ関数のエクスポート
// 工具函數導出
export * from './utils/dom';
export * from './utils/device';
export * from './utils/url';
export * from './utils/safe';
