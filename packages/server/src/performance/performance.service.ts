/**
 * 性能分析服务
 * Performance Analysis Service
 * パフォーマンス分析サービス
 * 效能分析服務
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { PerformanceData } from '@rewind-dev/shared';

/**
 * 性能分析服务类
 * Performance Analysis Service Class
 * パフォーマンス分析サービスクラス
 * 效能分析服務類
 */
@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 保存性能数据
   * Save performance data
   * パフォーマンスデータを保存
   * 儲存效能資料
   * 
   * @param params - 保存参数 / Save parameters / 保存パラメータ / 儲存參數
   */
  async savePerformanceData(params: {
    projectId: string;
    sessionId: string;
    userId?: string;
    data: PerformanceData;
  }): Promise<void> {
    const { projectId, sessionId, userId, data } = params;

    try {
      // 保存性能事件到 events 表
      // Save performance event to events table
      // events テーブルにパフォーマンスイベントを保存
      // 儲存效能事件到 events 表
      await this.prisma.event.create({
        data: {
          projectId,
          type: 'performance',
          timestamp: new Date(data.timestamp),
          sessionId,
          userId,
          pageUrl: data.pageUrl,
          data: data as any,
        },
      });

      // 异步聚合性能数据
      // Asynchronously aggregate performance data
      // 非同期でパフォーマンスデータを集計
      // 非同步聚合效能資料
      this.aggregatePerformanceData(params).catch((error) => {
        this.logger.error('Failed to aggregate performance data', error);
      });
    } catch (error) {
      this.logger.error('Failed to save performance data', error);
      throw error;
    }
  }

  /**
   * 聚合性能数据
   * Aggregate performance data
   * パフォーマンスデータを集計
   * 聚合效能資料
   * 
   * @param params - 聚合参数 / Aggregation parameters / 集計パラメータ / 聚合參數
   */
  private async aggregatePerformanceData(params: {
    projectId: string;
    data: PerformanceData;
  }): Promise<void> {
    const { projectId, data } = params;
    const { pageUrl, webVitals, timestamp } = data;

    // 计算当前小时的开始时间
    // Calculate start time of current hour
    // 現在の時間の開始時刻を計算
    // 計算當前小時的開始時間
    const periodStart = new Date(timestamp);
    periodStart.setMinutes(0, 0, 0);

    // 查找或创建聚合记录
    // Find or create aggregation record
    // 集計レコードを検索または作成
    // 查找或建立聚合記錄
    const existing = await this.prisma.performanceAggregation.findFirst({
      where: {
        projectId,
        pageUrl,
        period: 'hour',
        periodStart,
      },
    });

    if (existing) {
      // 更新现有记录（重新计算分位数）
      // Update existing record (recalculate percentiles)
      // 既存のレコードを更新（パーセンタイルを再計算）
      // 更新現有記錄（重新計算分位數）
      await this.updateAggregation(existing.id, webVitals);
    } else {
      // 创建新记录
      // Create new record
      // 新しいレコードを作成
      // 建立新記錄
      await this.prisma.performanceAggregation.create({
        data: {
          projectId,
          pageUrl,
          period: 'hour',
          periodStart,
          fcpP50: webVitals.fcp,
          fcpP75: webVitals.fcp,
          fcpP95: webVitals.fcp,
          lcpP50: webVitals.lcp,
          lcpP75: webVitals.lcp,
          lcpP95: webVitals.lcp,
          fidP50: webVitals.fid,
          fidP75: webVitals.fid,
          fidP95: webVitals.fid,
          clsP50: webVitals.cls,
          clsP75: webVitals.cls,
          clsP95: webVitals.cls,
          ttfbP50: webVitals.ttfb,
          ttfbP75: webVitals.ttfb,
          ttfbP95: webVitals.ttfb,
          sampleCount: 1,
        },
      });
    }
  }

  /**
   * 更新聚合数据
   * Update aggregation data
   * 集計データを更新
   * 更新聚合資料
   * 
   * @param aggregationId - 聚合记录 ID / Aggregation record ID / 集計レコード ID / 聚合記錄 ID
   * @param webVitals - Web Vitals 数据 / Web Vitals data / Web Vitals データ / Web Vitals 資料
   */
  private async updateAggregation(
    aggregationId: string,
    webVitals: Partial<{
      fcp?: number;
      lcp?: number;
      fid?: number;
      cls?: number;
      ttfb?: number;
    }>,
  ): Promise<void> {
    // 获取该聚合周期内的所有性能数据
    // Get all performance data in the aggregation period
    // 集計期間内のすべてのパフォーマンスデータを取得
    // 獲取該聚合週期內的所有效能資料
    const aggregation = await this.prisma.performanceAggregation.findUnique({
      where: { id: aggregationId },
    });

    if (!aggregation) return;

    // 获取该时间段的所有性能事件
    // Get all performance events in the time period
    // 期間内のすべてのパフォーマンスイベントを取得
    // 獲取該時間段的所有效能事件
    const events = await this.prisma.event.findMany({
      where: {
        projectId: aggregation.projectId,
        pageUrl: aggregation.pageUrl,
        type: 'performance',
        timestamp: {
          gte: aggregation.periodStart,
          lt: new Date(aggregation.periodStart.getTime() + 60 * 60 * 1000),
        },
      },
      select: {
        data: true,
      },
    });

    // 提取所有 Web Vitals 数据
    // Extract all Web Vitals data
    // すべての Web Vitals データを抽出
    // 提取所有 Web Vitals 資料
    const fcpValues: number[] = [];
    const lcpValues: number[] = [];
    const fidValues: number[] = [];
    const clsValues: number[] = [];
    const ttfbValues: number[] = [];

    for (const event of events) {
      const data = event.data as any;
      if (data.webVitals) {
        if (data.webVitals.fcp) fcpValues.push(data.webVitals.fcp);
        if (data.webVitals.lcp) lcpValues.push(data.webVitals.lcp);
        if (data.webVitals.fid) fidValues.push(data.webVitals.fid);
        if (data.webVitals.cls) clsValues.push(data.webVitals.cls);
        if (data.webVitals.ttfb) ttfbValues.push(data.webVitals.ttfb);
      }
    }

    // 计算分位数
    // Calculate percentiles
    // パーセンタイルを計算
    // 計算分位數
    const update: any = {
      sampleCount: events.length,
    };

    if (fcpValues.length > 0) {
      update.fcpP50 = this.calculatePercentile(fcpValues, 50);
      update.fcpP75 = this.calculatePercentile(fcpValues, 75);
      update.fcpP95 = this.calculatePercentile(fcpValues, 95);
    }

    if (lcpValues.length > 0) {
      update.lcpP50 = this.calculatePercentile(lcpValues, 50);
      update.lcpP75 = this.calculatePercentile(lcpValues, 75);
      update.lcpP95 = this.calculatePercentile(lcpValues, 95);
    }

    if (fidValues.length > 0) {
      update.fidP50 = this.calculatePercentile(fidValues, 50);
      update.fidP75 = this.calculatePercentile(fidValues, 75);
      update.fidP95 = this.calculatePercentile(fidValues, 95);
    }

    if (clsValues.length > 0) {
      update.clsP50 = this.calculatePercentile(clsValues, 50);
      update.clsP75 = this.calculatePercentile(clsValues, 75);
      update.clsP95 = this.calculatePercentile(clsValues, 95);
    }

    if (ttfbValues.length > 0) {
      update.ttfbP50 = this.calculatePercentile(ttfbValues, 50);
      update.ttfbP75 = this.calculatePercentile(ttfbValues, 75);
      update.ttfbP95 = this.calculatePercentile(ttfbValues, 95);
    }

    // 更新聚合记录
    // Update aggregation record
    // 集計レコードを更新
    // 更新聚合記錄
    await this.prisma.performanceAggregation.update({
      where: { id: aggregationId },
      data: update,
    });
  }

  /**
   * 计算分位数
   * Calculate percentile
   * パーセンタイルを計算
   * 計算分位數
   * 
   * @param values - 数值数组 / Value array / 値の配列 / 數值陣列
   * @param percentile - 分位数 (0-100) / Percentile (0-100) / パーセンタイル (0-100) / 分位數 (0-100)
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const sorted = values.slice().sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (lower === upper) {
      return sorted[lower];
    }

    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  /**
   * 获取性能概览
   * Get performance overview
   * パフォーマンス概要を取得
   * 獲取效能概覽
   * 
   * @param params - 查询参数 / Query parameters / クエリパラメータ / 查詢參數
   */
  async getOverview(params: Performance.QueryParams): Promise<Performance.OverviewData> {
    const { projectId, startTime, endTime } = params;

    // 查询聚合数据
    // Query aggregation data
    // 集計データをクエリ
    // 查詢聚合資料
    const aggregations = await this.prisma.performanceAggregation.findMany({
      where: {
        projectId,
        periodStart: {
          gte: startTime,
          lte: endTime,
        },
      },
    });

    if (aggregations.length === 0) {
      return this.getEmptyOverview();
    }

    // 计算总体分位数
    // Calculate overall percentiles
    // 全体のパーセンタイルを計算
    // 計算總體分位數
    const fcpValues: number[] = [];
    const lcpValues: number[] = [];
    const fidValues: number[] = [];
    const clsValues: number[] = [];
    const ttfbValues: number[] = [];

    for (const agg of aggregations) {
      if (agg.fcpP75) fcpValues.push(agg.fcpP75);
      if (agg.lcpP75) lcpValues.push(agg.lcpP75);
      if (agg.fidP75) fidValues.push(agg.fidP75);
      if (agg.clsP75) clsValues.push(agg.clsP75);
      if (agg.ttfbP75) ttfbValues.push(agg.ttfbP75);
    }

    const totalSamples = aggregations.reduce((sum, agg) => sum + agg.sampleCount, 0);

    return {
      fcpP50: this.calculatePercentile(fcpValues, 50),
      fcpP75: this.calculatePercentile(fcpValues, 75),
      fcpP95: this.calculatePercentile(fcpValues, 95),
      fcpPassRate: this.calculatePassRate(fcpValues, 1800), // FCP < 1.8s

      lcpP50: this.calculatePercentile(lcpValues, 50),
      lcpP75: this.calculatePercentile(lcpValues, 75),
      lcpP95: this.calculatePercentile(lcpValues, 95),
      lcpPassRate: this.calculatePassRate(lcpValues, 2500), // LCP < 2.5s

      fidP50: this.calculatePercentile(fidValues, 50),
      fidP75: this.calculatePercentile(fidValues, 75),
      fidP95: this.calculatePercentile(fidValues, 95),
      fidPassRate: this.calculatePassRate(fidValues, 100), // FID < 100ms

      clsP50: this.calculatePercentile(clsValues, 50),
      clsP75: this.calculatePercentile(clsValues, 75),
      clsP95: this.calculatePercentile(clsValues, 95),
      clsPassRate: this.calculatePassRate(clsValues, 0.1), // CLS < 0.1

      ttfbP50: this.calculatePercentile(ttfbValues, 50),
      ttfbP75: this.calculatePercentile(ttfbValues, 75),
      ttfbP95: this.calculatePercentile(ttfbValues, 95),
      ttfbPassRate: this.calculatePassRate(ttfbValues, 800), // TTFB < 800ms

      sampleCount: totalSamples,
    };
  }

  /**
   * 计算达标率
   * Calculate pass rate
   * 達成率を計算
   * 計算達標率
   * 
   * @param values - 数值数组 / Value array / 値の配列 / 數值陣列
   * @param threshold - 阈值 / Threshold / しきい値 / 閾值
   */
  private calculatePassRate(values: number[], threshold: number): number {
    if (values.length === 0) return 0;
    const passCount = values.filter((v) => v <= threshold).length;
    return (passCount / values.length) * 100;
  }

  /**
   * 获取空的概览数据
   * Get empty overview data
   * 空の概要データを取得
   * 獲取空的概覽資料
   */
  private getEmptyOverview(): Performance.OverviewData {
    return {
      fcpP50: 0,
      fcpP75: 0,
      fcpP95: 0,
      fcpPassRate: 0,
      lcpP50: 0,
      lcpP75: 0,
      lcpP95: 0,
      lcpPassRate: 0,
      fidP50: 0,
      fidP75: 0,
      fidP95: 0,
      fidPassRate: 0,
      clsP50: 0,
      clsP75: 0,
      clsP95: 0,
      clsPassRate: 0,
      ttfbP50: 0,
      ttfbP75: 0,
      ttfbP95: 0,
      ttfbPassRate: 0,
      sampleCount: 0,
    };
  }

  /**
   * 获取页面性能排行
   * Get page performance ranking
   * ページパフォーマンスランキングを取得
   * 獲取頁面效能排行
   * 
   * @param params - 查询参数 / Query parameters / クエリパラメータ / 查詢參數
   */
  async getPageRanking(params: Performance.QueryParams): Promise<Performance.PagePerformance[]> {
    const { projectId, startTime, endTime } = params;

    // 按页面分组聚合
    // Group and aggregate by page
    // ページごとにグループ化して集計
    // 按頁面分組聚合
    const result = await this.prisma.performanceAggregation.groupBy({
      by: ['pageUrl'],
      where: {
        projectId,
        periodStart: {
          gte: startTime,
          lte: endTime,
        },
      },
      _avg: {
        lcpP75: true,
        fcpP75: true,
        fidP75: true,
        clsP75: true,
      },
      _sum: {
        sampleCount: true,
      },
      orderBy: {
        _avg: {
          lcpP75: 'desc',
        },
      },
      take: 20,
    });

    return result.map((item) => ({
      pageUrl: item.pageUrl,
      lcpP75: item._avg.lcpP75 || 0,
      fcpP75: item._avg.fcpP75 || 0,
      fidP75: item._avg.fidP75 || 0,
      clsP75: item._avg.clsP75 || 0,
      sampleCount: item._sum.sampleCount || 0,
    }));
  }

  /**
   * 获取性能趋势
   * Get performance trend
   * パフォーマンストレンドを取得
   * 獲取效能趨勢
   * 
   * @param params - 查询参数 / Query parameters / クエリパラメータ / 查詢參數
   */
  async getTrend(params: Performance.QueryParams): Promise<Performance.TrendDataPoint[]> {
    const { projectId, startTime, endTime, pageUrl } = params;

    const aggregations = await this.prisma.performanceAggregation.findMany({
      where: {
        projectId,
        pageUrl,
        periodStart: {
          gte: startTime,
          lte: endTime,
        },
      },
      orderBy: {
        periodStart: 'asc',
      },
    });

    return aggregations.map((agg) => ({
      timestamp: agg.periodStart.getTime(),
      fcpP75: agg.fcpP75 || 0,
      lcpP75: agg.lcpP75 || 0,
      fidP75: agg.fidP75 || 0,
      clsP75: agg.clsP75 || 0,
      ttfbP75: agg.ttfbP75 || 0,
    }));
  }
}
