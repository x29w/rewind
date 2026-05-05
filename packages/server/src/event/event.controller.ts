/**
 * Event 控制器
 * Event Controller
 * Event コントローラー
 * Event 控制器
 */

import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { QueryEventsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /**
   * 获取 Issue 的事件列表
   * Get Issue Events
   * Issue のイベントリストを取得
   * 取得 Issue 的事件列表
   *
   * @description_zh 分页查询指定 Issue 的所有事件
   * @description_en Query all events of specified issue with pagination
   * @description_ja 指定された Issue のすべてのイベントをページネーションで取得
   * @description_tw 分頁查詢指定 Issue 的所有事件
   */
  @Get('issues/:issueId/events')
  async findByIssue(
    @Param('issueId') issueId: string,
    @Query() dto: QueryEventsDto,
  ) {
    return this.eventService.findByIssue({ issueId, dto });
  }

  /**
   * 获取事件详情
   * Get Event Detail
   * イベント詳細を取得
   * 取得事件詳情
   *
   * @description_zh 获取单个事件的完整信息（包含完整的 breadcrumbs）
   * @description_en Get complete information of a single event (including full breadcrumbs)
   * @description_ja 単一のイベントの完全な情報を取得（完全な breadcrumbs を含む）
   * @description_tw 取得單個事件的完整資訊（包含完整的 breadcrumbs）
   */
  @Get('issues/:issueId/events/:eventId')
  async findOne(@Param('eventId') eventId: string) {
    return this.eventService.findOne({ eventId });
  }

  /**
   * 对比多个事件
   * Compare Events
   * イベントを比較
   * 對比多個事件
   *
   * @description_zh 获取多个事件的关键信息用于对比分析
   * @description_en Get key information of multiple events for comparison
   * @description_ja 複数のイベントの主要情報を取得して比較分析
   * @description_tw 取得多個事件的關鍵資訊用於對比分析
   */
  @Get('issues/:issueId/compare-events')
  async compareEvents(@Query('ids') ids: string) {
    const eventIds = ids.split(',');
    return this.eventService.compareEvents({ eventIds });
  }

  /**
   * 获取会话时间线
   * Get Session Timeline
   * セッションタイムラインを取得
   * 取得會話時間線
   *
   * @description_zh 获取指定会话的所有事件，按时间排序
   * @description_en Get all events of specified session, sorted by time
   * @description_ja 指定されたセッションのすべてのイベントを時間順に取得
   * @description_tw 取得指定會話的所有事件，按時間排序
   */
  @Get('sessions/:sessionId/timeline')
  async getSessionTimeline(@Param('sessionId') sessionId: string) {
    return this.eventService.getSessionTimeline({ sessionId });
  }
}
