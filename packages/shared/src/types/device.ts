/**
 * 设备信息类型定义
 * Device Information Type Definitions
 * デバイス情報タイプ定義
 * 裝置資訊類型定義
 */

/**
 * 设备信息接口
 * Device Information Interface
 * デバイス情報インターフェース
 * 裝置資訊介面
 */
export interface DeviceInfo {
  /** 用户代理 / User agent / ユーザーエージェント / 用戶代理 */
  userAgent: string;
  
  /** 浏览器名称 / Browser name / ブラウザ名 / 瀏覽器名稱 */
  browser?: string;
  
  /** 浏览器版本 / Browser version / ブラウザバージョン / 瀏覽器版本 */
  browserVersion?: string;
  
  /** 操作系统 / Operating system / オペレーティングシステム / 作業系統 */
  os?: string;
  
  /** 操作系统版本 / OS version / OS バージョン / 作業系統版本 */
  osVersion?: string;
  
  /** 设备类型 / Device type / デバイスタイプ / 裝置類型 */
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  
  /** 屏幕宽度 / Screen width / 画面幅 / 螢幕寬度 */
  screenWidth?: number;
  
  /** 屏幕高度 / Screen height / 画面高さ / 螢幕高度 */
  screenHeight?: number;
  
  /** 视口宽度 / Viewport width / ビューポート幅 / 視口寬度 */
  viewportWidth?: number;
  
  /** 视口高度 / Viewport height / ビューポート高さ / 視口高度 */
  viewportHeight?: number;
  
  /** 设备像素比 / Device pixel ratio / デバイスピクセル比 / 裝置像素比 */
  devicePixelRatio?: number;
  
  /** 语言 / Language / 言語 / 語言 */
  language?: string;
  
  /** 时区 / Timezone / タイムゾーン / 時區 */
  timezone?: string;
}

/**
 * 网络信息接口
 * Network Information Interface
 * ネットワーク情報インターフェース
 * 網路資訊介面
 */
export interface NetworkInfo {
  /** 连接类型 / Connection type / 接続タイプ / 連接類型 */
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  
  /** 下行速度（Mbps） / Downlink speed (Mbps) / ダウンリンク速度（Mbps） / 下行速度（Mbps） */
  downlink?: number;
  
  /** RTT（毫秒） / RTT (ms) / RTT（ミリ秒） / RTT（毫秒） */
  rtt?: number;
  
  /** 是否省流量模式 / Save data mode / データ節約モード / 省流量模式 */
  saveData?: boolean;
}
