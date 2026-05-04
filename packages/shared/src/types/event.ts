/**
 * SDK 事件类型定义
 * SDK Event Type Definitions
 * SDK イベントタイプ定義
 * SDK 事件類型定義
 */

/**
 * 事件类型枚举
 * Event type enumeration
 * イベントタイプ列挙
 * 事件類型枚舉
 */
export type EventType = 'error' | 'blank_screen' | 'api_error' | 'performance';

/**
 * SDK 事件基础接口
 * SDK Event Base Interface
 * SDK イベント基本インターフェース
 * SDK 事件基礎介面
 */
export interface SDKEvent {
  /** 事件类型 / Event type / イベントタイプ / 事件類型 */
  type: EventType;
  
  /** 时间戳（毫秒） / Timestamp (milliseconds) / タイムスタンプ（ミリ秒） / 時間戳（毫秒） */
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
export interface ErrorEvent extends SDKEvent {
  type: 'error';
  data: {
    /** 错误消息 / Error message / エラーメッセージ / 錯誤訊息 */
    message: string;
    
    /** 错误堆栈 / Error stack / エラースタック / 錯誤堆疊 */
    stack?: string;
    
    /** 错误名称 / Error name / エラー名 / 錯誤名稱 */
    name?: string;
    
    /** 文件名 / Filename / ファイル名 / 檔案名 */
    filename?: string;
    
    /** 行号 / Line number / 行番号 / 行號 */
    lineno?: number;
    
    /** 列号 / Column number / 列番号 / 列號 */
    colno?: number;
  };
}

/**
 * 白屏事件
 * Blank Screen Event
 * ブランクスクリーンイベント
 * 白屏事件
 */
export interface BlankScreenEvent extends SDKEvent {
  type: 'blank_screen';
  data: {
    /** FCP 时间 / FCP time / FCP 時間 / FCP 時間 */
    fcp?: number;
    
    /** 检测时间 / Detection time / 検出時間 / 檢測時間 */
    detectionTime: number;
    
    /** DOM 采样结果 / DOM sampling result / DOM サンプリング結果 / DOM 採樣結果 */
    domSampling: {
      /** 采样点数量 / Sample point count / サンプルポイント数 / 採樣點數量 */
      sampleCount: number;
      
      /** 空白点数量 / Blank point count / 空白ポイント数 / 空白點數量 */
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
export interface APIErrorEvent extends SDKEvent {
  type: 'api_error';
  data: {
    /** 请求 URL / Request URL / リクエスト URL / 請求 URL */
    url: string;
    
    /** HTTP 方法 / HTTP method / HTTP メソッド / HTTP 方法 */
    method: string;
    
    /** 状态码 / Status code / ステータスコード / 狀態碼 */
    status: number;
    
    /** 响应时间（毫秒） / Response time (ms) / レスポンス時間（ミリ秒） / 響應時間（毫秒） */
    duration: number;
    
    /** 错误消息 / Error message / エラーメッセージ / 錯誤訊息 */
    message?: string;
  };
}

/**
 * 性能事件
 * Performance Event
 * パフォーマンスイベント
 * 效能事件
 */
export interface PerformanceEvent extends SDKEvent {
  type: 'performance';
  data: {
    /** FCP (First Contentful Paint) */
    fcp?: number;
    
    /** LCP (Largest Contentful Paint) */
    lcp?: number;
    
    /** FID (First Input Delay) */
    fid?: number;
    
    /** CLS (Cumulative Layout Shift) */
    cls?: number;
    
    /** TTFB (Time to First Byte) */
    ttfb?: number;
  };
}
