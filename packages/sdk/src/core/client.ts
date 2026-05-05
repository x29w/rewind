/**
 * SDK 客户端主类
 * SDK Client Main Class
 * SDK クライアントメインクラス
 * SDK 客戶端主類
 * 
 * 单例模式，提供 SDK 的核心功能
 * Singleton pattern, provides core SDK functionality
 * シングルトンパターン、SDK のコア機能を提供
 * 單例模式，提供 SDK 的核心功能
 */

import type { Breadcrumb, SDKEvent, DeviceInfo, NetworkInfo } from '@rewind-dev/shared';
import { BreadcrumbManager } from './breadcrumb-manager';
import { PluginManager, type Plugin } from './plugin-manager';

/**
 * SDK 配置接口
 * SDK Configuration Interface
 * SDK 設定インターフェース
 * SDK 配置介面
 */
export interface SDKConfig {
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
    [key: string]: any;
  };
  
  /** 标签 / Tags / タグ / 標籤 */
  tags?: Record<string, string>;
}

/**
 * 解析后的配置
 * Resolved Configuration
 * 解決済み設定
 * 解析後的配置
 */
export interface ResolvedConfig extends Required<Omit<SDKConfig, 'user' | 'tags'>> {
  user?: SDKConfig['user'];
  tags?: SDKConfig['tags'];
}

/**
 * 用户信息
 * User Information
 * ユーザー情報
 * 用戶資訊
 */
export interface UserInfo {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: any;
}

/**
 * SDK 客户端类
 * SDK Client Class
 * SDK クライアントクラス
 * SDK 客戶端類
 */
export class Client {
  /**
   * 单例实例
   * Singleton instance
   * シングルトンインスタンス
   * 單例實例
   */
  private static instance: Client | null = null;
  
  /**
   * 配置
   * Configuration
   * 設定
   * 配置
   */
  public config: ResolvedConfig;
  
  /**
   * 面包屑管理器
   * Breadcrumb manager
   * ブレッドクラムマネージャー
   * 麵包屑管理器
   */
  private breadcrumbManager: BreadcrumbManager;
  
  /**
   * 插件管理器
   * Plugin manager
   * プラグインマネージャー
   * 插件管理器
   */
  private pluginManager: PluginManager;
  
  /**
   * 会话 ID
   * Session ID
   * セッション ID
   * 會話 ID
   */
  private sessionId: string;
  
  /**
   * 用户信息
   * User information
   * ユーザー情報
   * 用戶資訊
   */
  private user?: UserInfo;
  
  /**
   * 设备信息
   * Device information
   * デバイス情報
   * 裝置資訊
   */
  private deviceInfo?: DeviceInfo;
  
  /**
   * 网络信息
   * Network information
   * ネットワーク情報
   * 網路資訊
   */
  private networkInfo?: NetworkInfo;
  
  /**
   * 是否已初始化
   * Whether initialized
   * 初期化済みか
   * 是否已初始化
   */
  private initialized = false;
  
  /**
   * 构造函数（私有）
   * Constructor (private)
   * コンストラクタ（プライベート）
   * 建構函式（私有）
   */
  private constructor(config: SDKConfig) {
    this.config = this.resolveConfig(config);
    this.breadcrumbManager = new BreadcrumbManager(this.config.maxBreadcrumbs);
    this.pluginManager = new PluginManager();
    this.sessionId = this.generateSessionId();
    this.user = config.user;
  }
  
  /**
   * 获取单例实例
   * Get singleton instance
   * シングルトンインスタンスを取得
   * 獲取單例實例
   */
  public static getInstance(): Client | null {
    return Client.instance;
  }
  
  /**
   * 初始化 SDK
   * Initialize SDK
   * SDK を初期化
   * 初始化 SDK
   * 
   * @param config - SDK 配置 / SDK configuration / SDK 設定 / SDK 配置
   */
  public static init(config: SDKConfig): Client {
    if (Client.instance) {
      console.warn('[Rewind SDK] SDK is already initialized');
      return Client.instance;
    }
    
    Client.instance = new Client(config);
    Client.instance.setup();
    
    return Client.instance;
  }
  
  /**
   * 设置 SDK
   * Setup SDK
   * SDK をセットアップ
   * 設置 SDK
   */
  private setup(): void {
    if (this.initialized) {
      return;
    }
    
    if (!this.config.enabled) {
      if (this.config.debug) {
        console.log('[Rewind SDK] SDK is disabled');
      }
      return;
    }
    
    // 初始化插件
    // Initialize plugins
    // プラグインを初期化
    // 初始化插件
    this.pluginManager.setupAll(this);
    
    this.initialized = true;
    
    if (this.config.debug) {
      console.log('[Rewind SDK] SDK initialized', {
        appId: this.config.appId,
        appVersion: this.config.appVersion,
        environment: this.config.environment,
        sessionId: this.sessionId,
      });
    }
  }
  
  /**
   * 解析配置
   * Resolve configuration
   * 設定を解決
   * 解析配置
   */
  private resolveConfig(config: SDKConfig): ResolvedConfig {
    return {
      dsn: config.dsn,
      appId: config.appId,
      appVersion: config.appVersion,
      environment: config.environment || 'production',
      sampleRate: config.sampleRate ?? 1.0,
      maxBreadcrumbs: config.maxBreadcrumbs || 50,
      enabled: config.enabled ?? true,
      debug: config.debug ?? false,
      user: config.user,
      tags: config.tags,
    };
  }
  
  /**
   * 生成会话 ID
   * Generate session ID
   * セッション ID を生成
   * 生成會話 ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  
  /**
   * 注册插件
   * Register plugin
   * プラグインを登録
   * 註冊插件
   * 
   * @param plugin - 插件实例 / Plugin instance / プラグインインスタンス / 插件實例
   */
  public use(plugin: Plugin): void {
    this.pluginManager.register(plugin);
  }
  
  /**
   * 捕获错误
   * Capture error
   * エラーをキャプチャ
   * 捕獲錯誤
   * 
   * @param error - 错误对象 / Error object / エラーオブジェクト / 錯誤物件
   * @param extra - 额外信息 / Extra information / 追加情報 / 額外資訊
   */
  public captureError(error: Error, extra?: Record<string, any>): void {
    if (!this.config.enabled || !this.shouldSample()) {
      return;
    }
    
    const event: SDKEvent = {
      type: 'error',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.user?.id,
      data: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...extra,
      },
    };
    
    this.sendEvent(event);
  }
  
  /**
   * 添加面包屑
   * Add breadcrumb
   * ブレッドクラムを追加
   * 添加麵包屑
   * 
   * @param breadcrumb - 面包屑对象 / Breadcrumb object / ブレッドクラムオブジェクト / 麵包屑物件
   */
  public addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.config.enabled) {
      return;
    }
    
    this.breadcrumbManager.push(breadcrumb);
    
    if (this.config.debug) {
      console.log('[Rewind SDK] Breadcrumb added:', breadcrumb);
    }
  }
  
  /**
   * 获取面包屑快照
   * Get breadcrumbs snapshot
   * ブレッドクラムスナップショットを取得
   * 獲取麵包屑快照
   */
  public getBreadcrumbs(): Breadcrumb[] {
    return this.breadcrumbManager.snapshot();
  }
  
  /**
   * 设置用户信息
   * Set user information
   * ユーザー情報を設定
   * 設置用戶資訊
   * 
   * @param user - 用户信息 / User information / ユーザー情報 / 用戶資訊
   */
  public setUser(user: UserInfo): void {
    this.user = user;
    
    if (this.config.debug) {
      console.log('[Rewind SDK] User set:', user);
    }
  }
  
  /**
   * 获取用户信息
   * Get user information
   * ユーザー情報を取得
   * 獲取用戶資訊
   */
  public getUser(): UserInfo | undefined {
    return this.user;
  }
  
  /**
   * 设置标签
   * Set tags
   * タグを設定
   * 設置標籤
   * 
   * @param tags - 标签 / Tags / タグ / 標籤
   */
  public setTags(tags: Record<string, string>): void {
    this.config.tags = {
      ...this.config.tags,
      ...tags,
    };
  }
  
  /**
   * 设置设备信息
   * Set device information
   * デバイス情報を設定
   * 設置裝置資訊
   * 
   * @param deviceInfo - 设备信息 / Device information / デバイス情報 / 裝置資訊
   */
  public setDeviceInfo(deviceInfo: DeviceInfo): void {
    this.deviceInfo = deviceInfo;
  }
  
  /**
   * 获取设备信息
   * Get device information
   * デバイス情報を取得
   * 獲取裝置資訊
   */
  public getDeviceInfo(): DeviceInfo | undefined {
    return this.deviceInfo;
  }
  
  /**
   * 设置网络信息
   * Set network information
   * ネットワーク情報を設定
   * 設置網路資訊
   * 
   * @param networkInfo - 网络信息 / Network information / ネットワーク情報 / 網路資訊
   */
  public setNetworkInfo(networkInfo: NetworkInfo): void {
    this.networkInfo = networkInfo;
  }
  
  /**
   * 获取网络信息
   * Get network information
   * ネットワーク情報を取得
   * 獲取網路資訊
   */
  public getNetworkInfo(): NetworkInfo | undefined {
    return this.networkInfo;
  }
  
  /**
   * 获取会话 ID
   * Get session ID
   * セッション ID を取得
   * 獲取會話 ID
   */
  public getSessionId(): string {
    return this.sessionId;
  }
  
  /**
   * 发送事件
   * Send event
   * イベントを送信
   * 發送事件
   * 
   * @param event - 事件对象 / Event object / イベントオブジェクト / 事件物件
   */
  public sendEvent(event: SDKEvent): void {
    if (!this.config.enabled || !this.shouldSample()) {
      return;
    }
    
    // 附加面包屑
    // Attach breadcrumbs
    // ブレッドクラムを添付
    // 附加麵包屑
    const enrichedEvent = {
      ...event,
      breadcrumbs: this.getBreadcrumbs(),
      deviceInfo: this.deviceInfo,
      networkInfo: this.networkInfo,
      tags: this.config.tags,
      appId: this.config.appId,
      appVersion: this.config.appVersion,
      environment: this.config.environment,
    };
    
    if (this.config.debug) {
      console.log('[Rewind SDK] Event sent:', enrichedEvent);
    }
    
    // 发送到服务器
    // Send to server
    // サーバーに送信
    // 發送到伺服器
    this.transport(enrichedEvent);
  }
  
  /**
   * 传输事件到服务器
   * Transport event to server
   * イベントをサーバーに転送
   * 傳輸事件到伺服器
   * 
   * @param event - 事件对象 / Event object / イベントオブジェクト / 事件物件
   */
  private transport(event: any): void {
    // 使用 sendBeacon 或 fetch 发送
    // Use sendBeacon or fetch to send
    // sendBeacon または fetch を使用して送信
    // 使用 sendBeacon 或 fetch 發送
    
    const url = `${this.config.dsn}/api/v1/report`;
    const payload = JSON.stringify(event);
    
    // 优先使用 sendBeacon（页面卸载时也能发送）
    // Prefer sendBeacon (can send even when page unloads)
    // sendBeacon を優先（ページアンロード時も送信可能）
    // 優先使用 sendBeacon（頁面卸載時也能發送）
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    } else {
      // 降级到 fetch
      // Fallback to fetch
      // fetch にフォールバック
      // 降級到 fetch
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
        keepalive: true,
      }).catch((error) => {
        if (this.config.debug) {
          console.error('[Rewind SDK] Failed to send event:', error);
        }
      });
    }
  }
  
  /**
   * 判断是否应该采样
   * Determine if should sample
   * サンプリングすべきか判断
   * 判斷是否應該採樣
   */
  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }
  
  /**
   * 销毁 SDK
   * Destroy SDK
   * SDK を破棄
   * 銷毀 SDK
   */
  public destroy(): void {
    this.pluginManager.teardownAll();
    this.breadcrumbManager.clear();
    this.initialized = false;
    Client.instance = null;
    
    if (this.config.debug) {
      console.log('[Rewind SDK] SDK destroyed');
    }
  }
}
