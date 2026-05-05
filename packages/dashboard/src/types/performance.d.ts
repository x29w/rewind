/**
 * 性能模块类型定义
 * Performance Module Type Definitions
 * パフォーマンスモジュールタイプ定義
 * 效能模組類型定義
 */

declare namespace Performance {
  /**
   * Web Vitals 指标
   * @description_zh Web Vitals 核心性能指标
   * @description_en Web Vitals core performance metrics
   * @description_ja Web Vitals コアパフォーマンス指標
   * @description_tw Web Vitals 核心效能指標
   */
  interface WebVitalsMetric {
    /** P50 分位值 / P50 percentile / P50 パーセンタイル / P50 分位值 */
    p50: number;
    /** P75 分位值 / P75 percentile / P75 パーセンタイル / P75 分位值 */
    p75: number;
    /** P95 分位值 / P95 percentile / P95 パーセンタイル / P95 分位值 */
    p95: number;
    /** 达标率 (%) / Pass rate (%) / 達成率 (%) / 達標率 (%) */
    passRate: number;
  }

  /**
   * 性能概览数据
   * @description_zh 性能指标概览统计
   * @description_en Performance metrics overview statistics
   * @description_ja パフォーマンス指標概要統計
   * @description_tw 效能指標概覽統計
   */
  interface OverviewData {
    /** FCP 指标 / FCP metrics / FCP 指標 / FCP 指標 */
    fcp: WebVitalsMetric;
    /** LCP 指标 / LCP metrics / LCP 指標 / LCP 指標 */
    lcp: WebVitalsMetric;
    /** FID 指标 / FID metrics / FID 指標 / FID 指標 */
    fid: WebVitalsMetric;
    /** CLS 指标 / CLS metrics / CLS 指標 / CLS 指標 */
    cls: WebVitalsMetric;
    /** TTFB 指标 / TTFB metrics / TTFB 指標 / TTFB 指標 */
    ttfb: WebVitalsMetric;
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
    /** 开始时间 / Start time / 開始時間 / 開始時間 */
    startTime?: string;
    /** 结束时间 / End time / 終了時間 / 結束時間 */
    endTime?: string;
    /** 页面 URL / Page URL / ページ URL / 頁面 URL */
    pageUrl?: string;
  }

  /**
   * Web Vitals 评分等级
   * @description_zh Web Vitals 性能评分等级
   * @description_en Web Vitals performance score level
   * @description_ja Web Vitals パフォーマンススコアレベル
   * @description_tw Web Vitals 效能評分等級
   */
  type ScoreLevel = 'good' | 'needs-improvement' | 'poor';

  /**
   * Web Vitals 阈值配置
   * @description_zh Web Vitals 各指标的阈值配置
   * @description_en Threshold configuration for Web Vitals metrics
   * @description_ja Web Vitals 指標のしきい値設定
   * @description_tw Web Vitals 各指標的閾值配置
   */
  interface ThresholdConfig {
    /** 良好阈值 / Good threshold / 良好しきい値 / 良好閾值 */
    good: number;
    /** 需要改进阈值 / Needs improvement threshold / 改善が必要なしきい値 / 需要改進閾值 */
    needsImprovement: number;
  }
}
