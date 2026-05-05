/**
 * 性能模块类型定义
 * Performance Module Type Definitions
 * パフォーマンスモジュールタイプ定義
 * 效能模組類型定義
 */

declare namespace Performance {
  /**
   * 性能概览数据
   * @description_zh 性能指标概览统计
   * @description_en Performance metrics overview statistics
   * @description_ja パフォーマンス指標概要統計
   * @description_tw 效能指標概覽統計
   */
  interface OverviewData {
    /** FCP P50 / FCP P50 / FCP P50 / FCP P50 */
    fcpP50: number;
    /** FCP P75 / FCP P75 / FCP P75 / FCP P75 */
    fcpP75: number;
    /** FCP P95 / FCP P95 / FCP P95 / FCP P95 */
    fcpP95: number;
    /** FCP 达标率 / FCP pass rate / FCP 達成率 / FCP 達標率 */
    fcpPassRate: number;
    
    /** LCP P50 / LCP P50 / LCP P50 / LCP P50 */
    lcpP50: number;
    /** LCP P75 / LCP P75 / LCP P75 / LCP P75 */
    lcpP75: number;
    /** LCP P95 / LCP P95 / LCP P95 / LCP P95 */
    lcpP95: number;
    /** LCP 达标率 / LCP pass rate / LCP 達成率 / LCP 達標率 */
    lcpPassRate: number;
    
    /** FID P50 / FID P50 / FID P50 / FID P50 */
    fidP50: number;
    /** FID P75 / FID P75 / FID P75 / FID P75 */
    fidP75: number;
    /** FID P95 / FID P95 / FID P95 / FID P95 */
    fidP95: number;
    /** FID 达标率 / FID pass rate / FID 達成率 / FID 達標率 */
    fidPassRate: number;
    
    /** CLS P50 / CLS P50 / CLS P50 / CLS P50 */
    clsP50: number;
    /** CLS P75 / CLS P75 / CLS P75 / CLS P75 */
    clsP75: number;
    /** CLS P95 / CLS P95 / CLS P95 / CLS P95 */
    clsP95: number;
    /** CLS 达标率 / CLS pass rate / CLS 達成率 / CLS 達標率 */
    clsPassRate: number;
    
    /** TTFB P50 / TTFB P50 / TTFB P50 / TTFB P50 */
    ttfbP50: number;
    /** TTFB P75 / TTFB P75 / TTFB P75 / TTFB P75 */
    ttfbP75: number;
    /** TTFB P95 / TTFB P95 / TTFB P95 / TTFB P95 */
    ttfbP95: number;
    /** TTFB 达标率 / TTFB pass rate / TTFB 達成率 / TTFB 達標率 */
    ttfbPassRate: number;
    
    /** 样本数量 / Sample count / サンプル数 / 樣本數量 */
    sampleCount: number;
  }

  /**
   * 页面性能数据
   * @description_zh 单个页面的性能统计
   * @description_en Performance statistics for a single page
   * @description_ja 単一ページのパフォーマンス統計
   * @description_tw 單一頁面的效能統計
   */
  interface PagePerformance {
    /** 页面 URL / Page URL / ページ URL / 頁面 URL */
    pageUrl: string;
    /** LCP P75 / LCP P75 / LCP P75 / LCP P75 */
    lcpP75: number;
    /** FCP P75 / FCP P75 / FCP P75 / FCP P75 */
    fcpP75: number;
    /** FID P75 / FID P75 / FID P75 / FID P75 */
    fidP75: number;
    /** CLS P75 / CLS P75 / CLS P75 / CLS P75 */
    clsP75: number;
    /** 样本数量 / Sample count / サンプル数 / 樣本數量 */
    sampleCount: number;
  }

  /**
   * 性能趋势数据点
   * @description_zh 性能指标随时间变化的数据点
   * @description_en Performance metrics data point over time
   * @description_ja 時間経過に伴うパフォーマンス指標データポイント
   * @description_tw 效能指標隨時間變化的資料點
   */
  interface TrendDataPoint {
    /** 时间戳 / Timestamp / タイムスタンプ / 時間戳 */
    timestamp: number;
    /** FCP P75 / FCP P75 / FCP P75 / FCP P75 */
    fcpP75: number;
    /** LCP P75 / LCP P75 / LCP P75 / LCP P75 */
    lcpP75: number;
    /** FID P75 / FID P75 / FID P75 / FID P75 */
    fidP75: number;
    /** CLS P75 / CLS P75 / CLS P75 / CLS P75 */
    clsP75: number;
    /** TTFB P75 / TTFB P75 / TTFB P75 / TTFB P75 */
    ttfbP75: number;
  }

  /**
   * 查询参数
   * @description_zh 性能数据查询参数
   * @description_en Performance data query parameters
   * @description_ja パフォーマンスデータクエリパラメータ
   * @description_tw 效能資料查詢參數
   */
  interface QueryParams {
    /** 项目 ID / Project ID / プロジェクト ID / 專案 ID */
    projectId: string;
    /** 开始时间 / Start time / 開始時間 / 開始時間 */
    startTime?: Date;
    /** 结束时间 / End time / 終了時間 / 結束時間 */
    endTime?: Date;
    /** 页面 URL / Page URL / ページ URL / 頁面 URL */
    pageUrl?: string;
    /** 环境 / Environment / 環境 / 環境 */
    environment?: string;
  }
}
