/**
 * 插件管理器
 * Plugin Manager
 * プラグインマネージャー
 * 插件管理器
 * 
 * 负责插件的注册、初始化和生命周期管理
 * Responsible for plugin registration, initialization and lifecycle management
 * プラグインの登録、初期化、ライフサイクル管理を担当
 * 負責插件的註冊、初始化和生命週期管理
 */

import type { Client } from './types/index.d';

/**
 * 插件接口
 * Plugin Interface
 * プラグインインターフェース
 * 插件介面
 */
export interface Plugin {
  /**
   * 插件名称
   * Plugin name
   * プラグイン名
   * 插件名稱
   */
  name: string;
  
  /**
   * 初始化方法
   * Setup method
   * セットアップメソッド
   * 初始化方法
   * 
   * @param client - 客户端实例 / Client instance / クライアントインスタンス / 客戶端實例
   */
  setup(client: Client): void;
  
  /**
   * 清理方法（可选）
   * Teardown method (optional)
   * クリーンアップメソッド（オプション）
   * 清理方法（可選）
   */
  teardown?(): void;
}

/**
 * 插件管理器类
 * Plugin Manager Class
 * プラグインマネージャークラス
 * 插件管理器類
 */
export class PluginManager {
  /**
   * 已注册的插件列表
   * Registered plugins list
   * 登録済みプラグインリスト
   * 已註冊的插件列表
   */
  private plugins: Plugin[] = [];
  
  /**
   * 插件是否已初始化
   * Whether plugins are initialized
   * プラグインが初期化されているか
   * 插件是否已初始化
   */
  private initialized = false;
  
  /**
   * 注册插件
   * Register plugin
   * プラグインを登録
   * 註冊插件
   * 
   * @param plugin - 插件实例 / Plugin instance / プラグインインスタンス / 插件實例
   */
  register(plugin: Plugin): void {
    if (this.initialized) {
      console.warn(`[PluginManager] Cannot register plugin "${plugin.name}" after initialization`);
      return;
    }
    
    // 检查是否已注册同名插件
    // Check if plugin with same name is already registered
    // 同名のプラグインが既に登録されているか確認
    // 檢查是否已註冊同名插件
    const existing = this.plugins.find(p => p.name === plugin.name);
    if (existing) {
      console.warn(`[PluginManager] Plugin "${plugin.name}" is already registered`);
      return;
    }
    
    this.plugins.push(plugin);
  }
  
  /**
   * 初始化所有插件
   * Initialize all plugins
   * すべてのプラグインを初期化
   * 初始化所有插件
   * 
   * @param client - 客户端实例 / Client instance / クライアントインスタンス / 客戶端實例
   */
  setupAll(client: Client): void {
    if (this.initialized) {
      console.warn('[PluginManager] Plugins are already initialized');
      return;
    }
    
    for (const plugin of this.plugins) {
      try {
        plugin.setup(client);
        
        if (client.config.debug) {
          console.log(`[PluginManager] Plugin "${plugin.name}" initialized`);
        }
      } catch (error) {
        console.error(`[PluginManager] Failed to initialize plugin "${plugin.name}":`, error);
      }
    }
    
    this.initialized = true;
  }
  
  /**
   * 清理所有插件
   * Teardown all plugins
   * すべてのプラグインをクリーンアップ
   * 清理所有插件
   */
  teardownAll(): void {
    if (!this.initialized) {
      return;
    }
    
    // 逆序清理插件
    // Teardown plugins in reverse order
    // プラグインを逆順でクリーンアップ
    // 逆序清理插件
    for (let i = this.plugins.length - 1; i >= 0; i--) {
      const plugin = this.plugins[i];
      
      if (plugin.teardown) {
        try {
          plugin.teardown();
        } catch (error) {
          console.error(`[PluginManager] Failed to teardown plugin "${plugin.name}":`, error);
        }
      }
    }
    
    this.initialized = false;
  }
  
  /**
   * 获取已注册的插件列表
   * Get registered plugins list
   * 登録済みプラグインリストを取得
   * 獲取已註冊的插件列表
   */
  getPlugins(): Plugin[] {
    return [...this.plugins];
  }
  
  /**
   * 根据名称获取插件
   * Get plugin by name
   * 名前でプラグインを取得
   * 根據名稱獲取插件
   * 
   * @param name - 插件名称 / Plugin name / プラグイン名 / 插件名稱
   */
  getPlugin(name: string): Plugin | undefined {
    return this.plugins.find(p => p.name === name);
  }
  
  /**
   * 检查插件是否已注册
   * Check if plugin is registered
   * プラグインが登録されているか確認
   * 檢查插件是否已註冊
   * 
   * @param name - 插件名称 / Plugin name / プラグイン名 / 插件名稱
   */
  hasPlugin(name: string): boolean {
    return this.plugins.some(p => p.name === name);
  }
}
