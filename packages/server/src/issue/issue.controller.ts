/**
 * Issue 控制器
 * Issue Controller
 * Issue コントローラー
 * Issue 控制器
 */

import {
  Controller,
  Get,
  Patch,
  Query,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { IssueService } from './issue.service';
import { QueryIssuesDto, UpdateIssueStatusDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  /**
   * 获取项目的 Issue 列表
   * Get Project Issues
   * プロジェクトの Issue リストを取得
   * 取得專案的 Issue 列表
   *
   * @description_zh 分页查询项目的 Issue 列表，支持筛选和排序
   * @description_en Query project issues with pagination, filtering and sorting
   * @description_ja プロジェクトの Issue リストをページネーション、フィルタリング、ソートで取得
   * @description_tw 分頁查詢專案的 Issue 列表，支援篩選和排序
   */
  @Get('projects/:projectId/issues')
  async findAll(
    @Param('projectId') projectId: string,
    @Query() dto: QueryIssuesDto,
  ) {
    return this.issueService.findAll({ projectId, dto });
  }

  /**
   * 获取 Issue 详情
   * Get Issue Detail
   * Issue 詳細を取得
   * 取得 Issue 詳情
   *
   * @description_zh 获取单个 Issue 的详细信息
   * @description_en Get detailed information of a single issue
   * @description_ja 単一の Issue の詳細情報を取得
   * @description_tw 取得單個 Issue 的詳細資訊
   */
  @Get('issues/:id')
  async findOne(@Param('id') issueId: string) {
    return this.issueService.findOne({ issueId });
  }

  /**
   * 更新 Issue 状态
   * Update Issue Status
   * Issue ステータスを更新
   * 更新 Issue 狀態
   *
   * @description_zh 更新 Issue 的状态（open/resolved/ignored/regressed）
   * @description_en Update issue status (open/resolved/ignored/regressed)
   * @description_ja Issue のステータスを更新（open/resolved/ignored/regressed）
   * @description_tw 更新 Issue 的狀態（open/resolved/ignored/regressed）
   */
  @Patch('issues/:id/status')
  async updateStatus(
    @Param('id') issueId: string,
    @Body() dto: UpdateIssueStatusDto,
  ) {
    return this.issueService.updateStatus({ issueId, dto });
  }

  /**
   * 获取 Issue 趋势数据
   * Get Issue Trend
   * Issue トレンドデータを取得
   * 取得 Issue 趨勢數據
   *
   * @description_zh 获取 Issue 在指定天数内的事件数量趋势
   * @description_en Get issue event count trend over specified days
   * @description_ja 指定日数内の Issue のイベント数トレンドを取得
   * @description_tw 取得 Issue 在指定天數內的事件數量趨勢
   */
  @Get('issues/:id/trend')
  async getTrend(
    @Param('id') issueId: string,
    @Query('days') days?: number,
  ) {
    return this.issueService.getTrend({ issueId, days });
  }

  /**
   * 获取 Issue 环境分布
   * Get Issue Distribution
   * Issue 環境分布を取得
   * 取得 Issue 環境分佈
   *
   * @description_zh 获取 Issue 在不同浏览器、操作系统、版本的分布情况
   * @description_en Get issue distribution across browsers, OS, and versions
   * @description_ja 異なるブラウザ、OS、バージョンでの Issue の分布を取得
   * @description_tw 取得 Issue 在不同瀏覽器、作業系統、版本的分佈情況
   */
  @Get('issues/:id/distribution')
  async getDistribution(@Param('id') issueId: string) {
    return this.issueService.getDistribution({ issueId });
  }
}
