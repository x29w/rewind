/**
 * 面包屑类型定义
 * Breadcrumb Type Definitions
 * ブレッドクラムタイプ定義
 * 麵包屑類型定義
 */

/**
 * 面包屑类型枚举
 * Breadcrumb type enumeration
 * ブレッドクラムタイプ列挙
 * 麵包屑類型枚舉
 */
export type BreadcrumbType = 
  | 'click'
  | 'navigation'
  | 'console'
  | 'xhr'
  | 'fetch'
  | 'custom';

/**
 * 面包屑级别
 * Breadcrumb level
 * ブレッドクラムレベル
 * 麵包屑級別
 */
export type BreadcrumbLevel = 'debug' | 'info' | 'warning' | 'error';

/**
 * 面包屑接口
 * Breadcrumb Interface
 * ブレッドクラムインターフェース
 * 麵包屑介面
 */
export interface Breadcrumb {
  /** 类型 / Type / タイプ / 類型 */
  type: BreadcrumbType;
  
  /** 级别 / Level / レベル / 級別 */
  level: BreadcrumbLevel;
  
  /** 消息 / Message / メッセージ / 訊息 */
  message: string;
  
  /** 时间戳（毫秒） / Timestamp (ms) / タイムスタンプ（ミリ秒） / 時間戳（毫秒） */
  timestamp: number;
  
  /** 数据 / Data / データ / 數據 */
  data?: Record<string, any>;
  
  /** 分类 / Category / カテゴリ / 分類 */
  category?: string;
}

/**
 * 点击面包屑
 * Click Breadcrumb
 * クリックブレッドクラム
 * 點擊麵包屑
 */
export interface ClickBreadcrumb extends Breadcrumb {
  type: 'click';
  data: {
    /** 元素选择器 / Element selector / 要素セレクタ / 元素選擇器 */
    selector: string;
    
    /** 元素文本 / Element text / 要素テキスト / 元素文字 */
    text?: string;
    
    /** 元素标签 / Element tag / 要素タグ / 元素標籤 */
    tagName: string;
  };
}

/**
 * 导航面包屑
 * Navigation Breadcrumb
 * ナビゲーションブレッドクラム
 * 導航麵包屑
 */
export interface NavigationBreadcrumb extends Breadcrumb {
  type: 'navigation';
  data: {
    /** 来源 URL / From URL / 元 URL / 來源 URL */
    from: string;
    
    /** 目标 URL / To URL / 先 URL / 目標 URL */
    to: string;
  };
}

/**
 * XHR/Fetch 面包屑
 * XHR/Fetch Breadcrumb
 * XHR/Fetch ブレッドクラム
 * XHR/Fetch 麵包屑
 */
export interface HTTPBreadcrumb extends Breadcrumb {
  type: 'xhr' | 'fetch';
  data: {
    /** 请求 URL / Request URL / リクエスト URL / 請求 URL */
    url: string;
    
    /** HTTP 方法 / HTTP method / HTTP メソッド / HTTP 方法 */
    method: string;
    
    /** 状态码 / Status code / ステータスコード / 狀態碼 */
    status?: number;
    
    /** 响应时间（毫秒） / Response time (ms) / レスポンス時間（ミリ秒） / 響應時間（毫秒） */
    duration?: number;
  };
}
