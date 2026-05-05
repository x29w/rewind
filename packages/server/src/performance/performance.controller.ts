/**
 * 性能分析控制器
 * Performance Analysis Controller
 * パフォーマンス分析コントローラー
 * 效能分析控制器
 */

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PerformanceService } from './performance.service';
import { CurrentProject } from '../common/decorators/current-project.decorator';

/**
 * 性能分析控制器类
 * Performance Analysis Controller Class
 * パフォーマンス分析コントローラークラス
 * 效能分析控制器類
 */
@Controller('api/v1/performance')
@UseGuards(JwtAuthGuard)
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

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
  @Get('overview')
  async getOverview(
    @CurrentProject() projectId: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ): Promise<Performance.OverviewData> {
    return this.performanceService.getOverview({
      projectId,
      startTime: startTime ? new Date(startTime) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endTime: endTime ? new Date(endTime) : new Date(),
    });
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
  @Get('pages')
  async getPageRanking(
    @CurrentProject() projectId: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ): Promise<Performance.PagePerformance[]> {
    return this.performanceService.getPageRanking({
      projectId,
      startTime: startTime ? new Date(startTime) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endTime: endTime ? new Date(endTime) : new Date(),
    });
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
  @Get('trend')
  async getTrend(
    @CurrentProject() projectId: string,
    @Query('pageUrl') pageUrl: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ): Promise<Performance.TrendDataPoint[]> {
    return this.performanceService.getTrend({
      projectId,
      pageUrl,
      startTime: startTime ? new Date(startTime) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endTime: endTime ? new Date(endTime) : new Date(),
    });
  }
}
