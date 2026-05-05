/**
 * 性能相关类型定义
 * Performance Related Type Definitions
 * パフォーマンス関連タイプ定義
 * 效能相關類型定義
 */

/**
 * Web Vitals 指标
 * @description_zh Web Vitals 核心性能指标
 * @description_en Web Vitals core performance metrics
 * @description_ja Web Vitals コアパフォーマンス指標
 * @description_tw Web Vitals 核心效能指標
 */
export interface WebVitals {
  /** 首次内容绘制 / First Contentful Paint / 最初のコンテンツ描画 / 首次內容繪製 */
  fcp?: number;
  
  /** 最大内容绘制 / Largest Contentful Paint / 最大コンテンツ描画 / 最大內容繪製 */
  lcp?: number;
  
  /** 首次输入延迟 / First Input Delay / 最初の入力遅延 / 首次輸入延遲 */
  fid?: number;
  
  /** 累计布局偏移 / Cumulative Layout Shift / 累積レイアウトシフト / 累計佈局偏移 */
  cls?: number;
  
  /** 首字节时间 / Time to First Byte / 最初のバイト時間 / 首字節時間 */
  ttfb?: number;
  
  /** 交互时间 / Time to Interactive / インタラクティブ時間 / 互動時間 */
  tti?: number;
  
  /** 总阻塞时间 / Total Blocking Time / 総ブロッキング時間 / 總阻塞時間 */
  tbt?: number;
}

/**
 * 导航时序
 * @description_zh 页面导航时序数据
 * @description_en Page navigation timing data
 * @description_ja ページナビゲーションタイミングデータ
 * @description_tw 頁面導航時序資料
 */
export interface NavigationTiming {
  /** DNS 查询时间 / DNS lookup time / DNS ルックアップ時間 / DNS 查詢時間 */
  dnsTime?: number;
  
  /** TCP 连接时间 / TCP connection time / TCP 接続時間 / TCP 連接時間 */
  tcpTime?: number;
  
  /** SSL 握手时间 / SSL handshake time / SSL ハンドシェイク時間 / SSL 握手時間 */
  sslTime?: number;
  
  /** 请求时间 / Request time / リクエスト時間 / 請求時間 */
  requestTime?: number;
  
  /** 响应时间 / Response time / レスポンス時間 / 回應時間 */
  responseTime?: number;
  
  /** DOM 解析时间 / DOM parsing time / DOM 解析時間 / DOM 解析時間 */
  domParseTime?: number;
  
  /** 资源加载时间 / Resource loading time / リソース読み込み時間 / 資源載入時間 */
  resourceLoadTime?: number;
  
  /** DOM 内容加载完成时间 / DOM content loaded time / DOM コンテンツ読み込み完了時間 / DOM 內容載入完成時間 */
  domContentLoadedTime?: number;
  
  /** 页面完全加载时间 / Page fully loaded time / ページ完全読み込み時間 / 頁面完全載入時間 */
  loadTime?: number;
}

/**
 * 资源时序
 * @description_zh 资源加载时序数据
 * @description_en Resource loading timing data
 * @description_ja リソース読み込みタイミングデータ
 * @description_tw 資源載入時序資料
 */
export interface ResourceTiming {
  /** 资源名称 / Resource name / リソース名 / 資源名稱 */
  name: string;
  
  /** 资源类型 / Resource type / リソースタイプ / 資源類型 */
  type: 'script' | 'css' | 'img' | 'font' | 'xhr' | 'fetch' | 'other';
  
  /** 开始时间 / Start time / 開始時間 / 開始時間 */
  startTime: number;
  
  /** 持续时间 / Duration / 持続時間 / 持續時間 */
  duration: number;
  
  /** 传输大小 / Transfer size / 転送サイズ / 傳輸大小 */
  transferSize?: number;
  
  /** 编码大小 / Encoded size / エンコードサイズ / 編碼大小 */
  encodedSize?: number;
  
  /** 解码大小 / Decoded size / デコードサイズ / 解碼大小 */
  decodedSize?: number;
}

/**
 * 长任务
 * @description_zh 长任务数据（阻塞主线程 > 50ms）
 * @description_en Long task data (blocking main thread > 50ms)
 * @description_ja ロングタスクデータ（メインスレッドブロック > 50ms）
 * @description_tw 長任務資料（阻塞主執行緒 > 50ms）
 */
export interface LongTask {
  /** 开始时间 / Start time / 開始時間 / 開始時間 */
  startTime: number;
  
  /** 持续时间 / Duration / 持続時間 / 持續時間 */
  duration: number;
  
  /** 归因 / Attribution / 帰属 / 歸因 */
  attribution?: {
    /** 容器类型 / Container type / コンテナタイプ / 容器類型 */
    containerType: string;
    
    /** 容器名称 / Container name / コンテナ名 / 容器名稱 */
    containerName: string;
    
    /** 容器 ID / Container ID / コンテナ ID / 容器 ID */
    containerId: string;
  };
}

/**
 * 内存信息
 * @description_zh 内存使用信息
 * @description_en Memory usage information
 * @description_ja メモリ使用情報
 * @description_tw 記憶體使用資訊
 */
export interface MemoryInfo {
  /** JS 堆大小限制 / JS heap size limit / JS ヒープサイズ制限 / JS 堆大小限制 */
  jsHeapSizeLimit?: number;
  
  /** 总 JS 堆大小 / Total JS heap size / 総 JS ヒープサイズ / 總 JS 堆大小 */
  totalJSHeapSize?: number;
  
  /** 已用 JS 堆大小 / Used JS heap size / 使用済み JS ヒープサイズ / 已用 JS 堆大小 */
  usedJSHeapSize?: number;
}

/**
 * 性能数据
 * @description_zh 完整的性能采集数据
 * @description_en Complete performance collection data
 * @description_ja 完全なパフォーマンス収集データ
 * @description_tw 完整的效能採集資料
 */
export interface PerformanceData {
  /** Web Vitals 指标 / Web Vitals metrics / Web Vitals 指標 / Web Vitals 指標 */
  webVitals: WebVitals;
  
  /** 导航时序 / Navigation timing / ナビゲーションタイミング / 導航時序 */
  navigationTiming?: NavigationTiming;
  
  /** 资源时序 / Resource timing / リソースタイミング / 資源時序 */
  resourceTiming?: ResourceTiming[];
  
  /** 长任务 / Long tasks / ロングタスク / 長任務 */
  longTasks?: LongTask[];
  
  /** 内存信息 / Memory info / メモリ情報 / 記憶體資訊 */
  memoryInfo?: MemoryInfo;
  
  /** 页面 URL / Page URL / ページ URL / 頁面 URL */
  pageUrl: string;
  
  /** 时间戳 / Timestamp / タイムスタンプ / 時間戳 */
  timestamp: number;
}

/**
 * 性能聚合数据
 * @description_zh 性能指标聚合统计
 * @description_en Performance metrics aggregation statistics
 * @description_ja パフォーマンス指標集計統計
 * @description_tw 效能指標聚合統計
 */
export interface PerformanceAggregation {
  /** 项目 ID / Project ID / プロジェクト ID / 專案 ID */
  projectId: string;
  
  /** 页面 URL / Page URL / ページ URL / 頁面 URL */
  pageUrl: string;
  
  /** 时间周期 / Time period / 時間周期 / 時間週期 */
  period: 'minute' | 'hour' | 'day';
  
  /** 周期开始时间 / Period start time / 周期開始時間 / 週期開始時間 */
  periodStart: Date;
  
  /** FCP P50 / FCP P50 / FCP P50 / FCP P50 */
  fcpP50?: number;
  
  /** FCP P75 / FCP P75 / FCP P75 / FCP P75 */
  fcpP75?: number;
  
  /** FCP P95 / FCP P95 / FCP P95 / FCP P95 */
  fcpP95?: number;
  
  /** LCP P50 / LCP P50 / LCP P50 / LCP P50 */
  lcpP50?: number;
  
  /** LCP P75 / LCP P75 / LCP P75 / LCP P75 */
  lcpP75?: number;
  
  /** LCP P95 / LCP P95 / LCP P95 / LCP P95 */
  lcpP95?: number;
  
  /** FID P50 / FID P50 / FID P50 / FID P50 */
  fidP50?: number;
  
  /** FID P75 / FID P75 / FID P75 / FID P75 */
  fidP75?: number;
  
  /** FID P95 / FID P95 / FID P95 / FID P95 */
  fidP95?: number;
  
  /** CLS P50 / CLS P50 / CLS P50 / CLS P50 */
  clsP50?: number;
  
  /** CLS P75 / CLS P75 / CLS P75 / CLS P75 */
  clsP75?: number;
  
  /** CLS P95 / CLS P95 / CLS P95 / CLS P95 */
  clsP95?: number;
  
  /** TTFB P50 / TTFB P50 / TTFB P50 / TTFB P50 */
  ttfbP50?: number;
  
  /** TTFB P75 / TTFB P75 / TTFB P75 / TTFB P75 */
  ttfbP75?: number;
  
  /** TTFB P95 / TTFB P95 / TTFB P95 / TTFB P95 */
  ttfbP95?: number;
  
  /** 样本数量 / Sample count / サンプル数 / 樣本數量 */
  sampleCount: number;
}
