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
import { TransportQueue } from './transport-queue';
import { Sender } from './sender';
import { OfflineStorage } from './offline-storage';

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
   * 上报队列
   * Transport queue
   * 送信キュー
   * 上報佇列
   */
  private transportQueue: TransportQueue;
  
  /**
   * 数据发送器
   * Data sender
   * データ送信
   * 資料發送器
   */
  private sender: Sender;
  
  /**
   * 离线存储
   * Offline storage
   * オフラインストレージ
   * 離線儲存
   */
  private offlineStorage: OfflineStorage;
  
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
    this.transportQueue = new TransportQueue({
      maxSize: 100,
      flushInterval: 5000,
    });
    this.sender = new Sender();
    this.offlineStorage = new OfflineStorage();
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
  private async setup(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    if (!this.config.enabled) {
      if (this.config.debug) {
        console.log('[Rewind SDK] SDK is disabled');
      }
      return;
    }
    
    // 初始化离线存储
    // Initialize offline storage
    // オフラインストレージを初期化
    // 初始化離線儲存
    await this.offlineStorage.init();
    
    // 恢复离线事件
    // Restore offline events
    // オフラインイベントを復元
    // 恢復離線事件
    await this.restoreOfflineEvents();
    
    // 监听上报事件
    // Listen to flush events
    // 送信イベントをリッスン
    // 監聽上報事件
    if (typeof window !== 'undefined') {
      window.addEventListener('rewind:flush', this.handleFlush.bind(this));
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
    // 加入上报队列
    // Add to transport queue
    // 送信キューに追加
    // 加入上報佇列
    this.transportQueue.push(event);
  }
  
  /**
   * 处理上报事件
   * Handle flush event
   * 送信イベントを処理
   * 處理上報事件
   */
  private async handleFlush(event: CustomEvent): Promise<void> {
    const { events } = event.detail;
    
    if (!events || events.length === 0) {
      return;
    }
    
    const url = `${this.config.dsn}/api/v1/report`;
    const payload = {
      sessionId: this.sessionId,
      userId: this.user?.id,
      pageUrl: window.location.href,
      events,
      device: this.deviceInfo,
      network: this.networkInfo,
      appVersion: this.config.appVersion,
      environment: this.config.environment,
    };
    
    try {
      const success = await this.sender.send({
        url,
        apiKey: this.config.appId,
        data: payload,
      });
      
      if (success) {
        this.transportQueue.onFlushSuccess();
        
        if (this.config.debug) {
          console.log('[Rewind SDK] Events sent successfully:', events.length);
        }
      } else {
        throw new Error('Send failed');
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('[Rewind SDK] Failed to send events:', error);
      }
      
      // 保存到离线存储
      // Save to offline storage
      // オフラインストレージに保存
      // 儲存到離線儲存
      for (const evt of events) {
        try {
          await this.offlineStorage.save(evt);
        } catch (err) {
          console.error('[Rewind SDK] Failed to save offline event:', err);
        }
      }
      
      this.transportQueue.onFlushFailure();
    }
  }
  
  /**
   * 恢复离线事件
   * Restore offline events
   * オフラインイベントを復元
   * 恢復離線事件
   */
  private async restoreOfflineEvents(): Promise<void> {
    try {
      const offlineEvents = await this.offlineStorage.getAll();
      
      if (offlineEvents.length === 0) {
        return;
      }
      
      if (this.config.debug) {
        console.log('[Rewind SDK] Restoring offline events:', offlineEvents.length);
      }
      
      // 重新加入队列
      // Re-add to queue
      // キューに再追加
      // 重新加入佇列
      for (const { id, event } of offlineEvents) {
        this.transportQueue.push(event);
      }
      
      // 清空离线存储
      // Clear offline storage
      // オフラインストレージをクリア
      // 清空離線儲存
      await this.offlineStorage.clear();
    } catch (error) {
      console.error('[Rewind SDK] Failed to restore offline events:', error);
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
    // 立即上报剩余事件
    // Flush remaining events immediately
    // 残りのイベントを即座に送信
    // 立即上報剩餘事件
    this.transportQueue.flush();
    
    // 移除事件监听
    // Remove event listeners
    // イベントリスナーを削除
    // 移除事件監聽
    if (typeof window !== 'undefined') {
      window.removeEventListener('rewind:flush', this.handleFlush.bind(this));
    }
    
    this.pluginManager.teardownAll();
    this.breadcrumbManager.clear();
    this.transportQueue.destroy();
    this.offlineStorage.close();
    this.initialized = false;
    Client.instance = null;
    
    if (this.config.debug) {
      console.log('[Rewind SDK] SDK destroyed');
    }
  }
}
