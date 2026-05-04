/**
 * Rewind 共享类型定义
 * Rewind Shared Type Definitions
 * Rewind 共有タイプ定義
 * Rewind 共享類型定義
 */

declare namespace Rewind {
  // ============================================
  // Event Types
  // ============================================
  
  /**
   * 事件类型枚举
   * Event type enumeration
   * イベントタイプ列挙
   * 事件類型枚舉
   */
  type EventType = 'error' | 'blank_screen' | 'api_error' | 'performance';
  
  /**
   * SDK 事件基础接口
   * SDK Event Base Interface
   * SDK イベント基本インターフェース
   * SDK 事件基礎介面
   */
  interface SDKEvent {
    /** 事件类型 / Event type / イベントタイプ / 事件類型 */
    type: EventType;
    /** 时间戳（毫秒） / Timestamp (ms) / タイムスタンプ（ミリ秒） / 時間戳（毫秒） */
    timestamp: number;
    /** 事件数据 / Event data / イベントデータ / 事件數據 */
    data: Record<string, any>;
    /** 会话 ID / Session ID / セッション ID / 會話 ID */
    sessionId?: string;
    /** 用户 ID / User ID / ユーザー ID / 用戶 ID */
    userId?: string;
  }
  
  /**
   * 错误事件
   * Error Event
   * エラーイベント
   * 錯誤事件
   */
  interface ErrorEvent extends SDKEvent {
    type: 'error';
    data: {
      message: string;
      stack?: string;
      name?: string;
      filename?: string;
      lineno?: number;
      colno?: number;
    };
  }
  
  /**
   * 白屏事件
   * Blank Screen Event
   * ブランクスクリーンイベント
   * 白屏事件
   */
  interface BlankScreenEvent extends SDKEvent {
    type: 'blank_screen';
    data: {
      fcp?: number;
      detectionTime: number;
      domSampling: {
        sampleCount: number;
        blankCount: number;
      };
    };
  }
  
  /**
   * API 错误事件
   * API Error Event
   * API エラーイベント
   * API 錯誤事件
   */
  interface APIErrorEvent extends SDKEvent {
    type: 'api_error';
    data: {
      url: string;
      method: string;
      status: number;
      duration: number;
      message?: string;
    };
  }
  
  /**
   * 性能事件
   * Performance Event
   * パフォーマンスイベント
   * 效能事件
   */
  interface PerformanceEvent extends SDKEvent {
    type: 'performance';
    data: {
      fcp?: number;
      lcp?: number;
      fid?: number;
      cls?: number;
      ttfb?: number;
    };
  }
  
  // ============================================
  // Breadcrumb Types
  // ============================================
  
  /**
   * 面包屑类型枚举
   * Breadcrumb type enumeration
   * ブレッドクラムタイプ列挙
   * 麵包屑類型枚舉
   */
  type BreadcrumbType = 'click' | 'navigation' | 'console' | 'xhr' | 'fetch' | 'custom';
  
  /**
   * 面包屑级别
   * Breadcrumb level
   * ブレッドクラムレベル
   * 麵包屑級別
   */
  type BreadcrumbLevel = 'debug' | 'info' | 'warning' | 'error';
  
  /**
   * 面包屑接口
   * Breadcrumb Interface
   * ブレッドクラムインターフェース
   * 麵包屑介面
   */
  interface Breadcrumb {
    type: BreadcrumbType;
    level: BreadcrumbLevel;
    message: string;
    timestamp: number;
    data?: Record<string, any>;
    category?: string;
  }
  
  /**
   * 点击面包屑
   * Click Breadcrumb
   * クリックブレッドクラム
   * 點擊麵包屑
   */
  interface ClickBreadcrumb extends Breadcrumb {
    type: 'click';
    data: {
      selector: string;
      text?: string;
      tagName: string;
    };
  }
  
  /**
   * 导航面包屑
   * Navigation Breadcrumb
   * ナビゲーションブレッドクラム
   * 導航麵包屑
   */
  interface NavigationBreadcrumb extends Breadcrumb {
    type: 'navigation';
    data: {
      from: string;
      to: string;
    };
  }
  
  /**
   * XHR/Fetch 面包屑
   * XHR/Fetch Breadcrumb
   * XHR/Fetch ブレッドクラム
   * XHR/Fetch 麵包屑
   */
  interface HTTPBreadcrumb extends Breadcrumb {
    type: 'xhr' | 'fetch';
    data: {
      url: string;
      method: string;
      status?: number;
      duration?: number;
    };
  }
  
  // ============================================
  // Device Types
  // ============================================
  
  /**
   * 设备信息接口
   * Device Information Interface
   * デバイス情報インターフェース
   * 裝置資訊介面
   */
  interface DeviceInfo {
    userAgent: string;
    browser?: string;
    browserVersion?: string;
    os?: string;
    osVersion?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    screenWidth?: number;
    screenHeight?: number;
    viewportWidth?: number;
    viewportHeight?: number;
    devicePixelRatio?: number;
    language?: string;
    timezone?: string;
  }
  
  /**
   * 网络信息接口
   * Network Information Interface
   * ネットワーク情報インターフェース
   * 網路資訊介面
   */
  interface NetworkInfo {
    effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  }
  
  // ============================================
  // Issue Types
  // ============================================
  
  /**
   * Issue 状态
   * Issue Status
   * Issue ステータス
   * Issue 狀態
   */
  type IssueStatus = 'open' | 'resolved' | 'ignored';
  
  /**
   * Issue 级别
   * Issue Level
   * Issue レベル
   * Issue 級別
   */
  type IssueLevel = 'fatal' | 'error' | 'warning' | 'info';
  
  /**
   * Issue 类型
   * Issue Type
   * Issue タイプ
   * Issue 類型
   */
  type IssueType = 'error' | 'blank_screen' | 'api_error' | 'performance';
  
  /**
   * Issue 基础接口
   * Issue Base Interface
   * Issue 基本インターフェース
   * Issue 基礎介面
   */
  interface Issue {
    id: string;
    fingerprint: string;
    type: IssueType;
    level: IssueLevel;
    status: IssueStatus;
    title: string;
    message: string;
    stack?: string;
    eventCount: number;
    userCount: number;
    firstSeen: Date;
    lastSeen: Date;
    appId: string;
    appVersion?: string;
    environment?: string;
    tags?: Record<string, string>;
    createdAt: Date;
    updatedAt: Date;
  }
  
  /**
   * Issue 事件
   * Issue Event
   * Issue イベント
   * Issue 事件
   */
  interface IssueEvent {
    id: string;
    issueId: string;
    event: SDKEvent;
    breadcrumbs: Breadcrumb[];
    device: DeviceInfo;
    network?: NetworkInfo;
    userId?: string;
    sessionId: string;
    pageUrl: string;
    createdAt: Date;
  }
  
  /**
   * Issue 详情
   * Issue Detail
   * Issue 詳細
   * Issue 詳情
   */
  interface IssueDetail extends Issue {
    recentEvents: IssueEvent[];
    aiAnalysis?: {
      summary?: string;
      possibleCauses?: string[];
      fixSuggestions?: string[];
    };
  }
}

export = Rewind;
export as namespace Rewind;
