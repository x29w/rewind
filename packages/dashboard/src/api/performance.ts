/**
 * 性能分析 API
 * Performance Analysis API
 * パフォーマンス分析 API
 * 效能分析 API
 */

import { client } from './client';

/**
 * 获取性能概览
 * Get performance overview
 * パフォーマンス概要を取得
 * 獲取效能概覽
 * 
 * @description_zh 获取项目的性能指标概览，包括 Web Vitals 的 P50/P75/P95 和达标率
 * @description_en Get project performance metrics overview, including Web Vitals P50/P75/P95 and pass rates
 * @description_ja プロジェクトのパフォーマンス指標概要を取得、Web Vitals の P50/P75/P95 と達成率を含む
 * @description_tw 獲取專案的效能指標概覽，包括 Web Vitals 的 P50/P75/P95 和達標率
 */
export async function getPerformanceOverview(params: Performance.QueryParams): Promise<Performance.OverviewData> {
  const response = await client.get('/api/v1/performance/overview', { params });
  
  // 转换 Server 返回的扁平结构为嵌套结构
  // Transform flat structure from server to nested structure
  // サーバーからのフラット構造をネスト構造に変換
  // 將伺服器返回的扁平結構轉換為嵌套結構
  const data = response.data;
  
  return {
    fcp: {
      p50: data.fcpP50,
      p75: data.fcpP75,
      p95: data.fcpP95,
      passRate: data.fcpPassRate,
    },
    lcp: {
      p50: data.lcpP50,
      p75: data.lcpP75,
      p95: data.lcpP95,
      passRate: data.lcpPassRate,
    },
    fid: {
      p50: data.fidP50,
      p75: data.fidP75,
      p95: data.fidP95,
      passRate: data.fidPassRate,
    },
    cls: {
      p50: data.clsP50,
      p75: data.clsP75,
      p95: data.clsP95,
      passRate: data.clsPassRate,
    },
    ttfb: {
      p50: data.ttfbP50,
      p75: data.ttfbP75,
      p95: data.ttfbP95,
      passRate: data.ttfbPassRate,
    },
    sampleCount: data.sampleCount,
  };
}

/**
 * 获取页面性能排行
 * Get page performance ranking
 * ページパフォーマンスランキングを取得
 * 獲取頁面效能排行
 * 
 * @description_zh 获取性能最差的页面排行，按 LCP P75 降序排列
 * @description_en Get worst performing pages ranking, ordered by LCP P75 descending
 * @description_ja パフォーマンスが最も悪いページのランキングを取得、LCP P75 降順
 * @description_tw 獲取效能最差的頁面排行，按 LCP P75 降序排列
 */
export async function getPagePerformanceRanking(params: Performance.QueryParams): Promise<Performance.PagePerformance[]> {
  const response = await client.get('/api/v1/performance/pages', { params });
  return response.data;
}

/**
 * 获取性能趋势
 * Get performance trend
 * パフォーマンストレンドを取得
 * 獲取效能趨勢
 * 
 * @description_zh 获取指定页面的性能指标随时间变化的趋势
 * @description_en Get performance metrics trend over time for specified page
 * @description_ja 指定されたページのパフォーマンス指標の時間経過に伴う傾向を取得
 * @description_tw 獲取指定頁面的效能指標隨時間變化的趨勢
 */
export async function getPerformanceTrend(params: Performance.QueryParams): Promise<Performance.TrendDataPoint[]> {
  const response = await client.get('/api/v1/performance/trend', { params });
  return response.data;
}
