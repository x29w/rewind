/**
 * Event 服务
 * Event Service
 * Event サービス
 * Event 服務
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryEventsDto } from './dto';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建事件
   * Create Event
   * イベントを作成
   * 建立事件
   *
   * @description_zh 保存标准化后的事件到数据库
   * @description_en Save normalized event to database
   * @description_ja 正規化されたイベントをデータベースに保存
   * @description_tw 儲存標準化後的事件到資料庫
   */
  async create({ eventData }: { eventData: any }) {
    return this.prisma.event.create({
      data: eventData,
    });
  }

  /**
   * 查询 Issue 的事件列表
   * Query Issue Events
   * Issue のイベントリストを取得
   * 查詢 Issue 的事件列表
   *
   * @description_zh 分页查询指定 Issue 的所有事件
   * @description_en Query all events of specified issue with pagination
   * @description_ja 指定された Issue のすべてのイベントをページネーションで取得
   * @description_tw 分頁查詢指定 Issue 的所有事件
   */
  async findByIssue({ issueId, dto }: { issueId: string; dto: QueryEventsDto }) {
    const where: any = { issueId };

    if (dto.userId) {
      where.userId = dto.userId;
    }

    if (dto.sessionId) {
      where.sessionId = dto.sessionId;
    }

    if (dto.startDate || dto.endDate) {
      where.timestamp = {};
      if (dto.startDate) {
        where.timestamp.gte = new Date(dto.startDate);
      }
      if (dto.endDate) {
        where.timestamp.lte = new Date(dto.endDate);
      }
    }

    const [total, items] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        orderBy: { timestamp: dto.sortOrder || 'desc' },
        skip: (dto.page - 1) * dto.pageSize,
        take: dto.pageSize,
        select: {
          id: true,
          type: true,
          subType: true,
          userId: true,
          sessionId: true,
          pageUrl: true,
          timestamp: true,
          device: true,
          appVersion: true,
          environment: true,
          eventData: true,
        },
      }),
    ]);

    return {
      items,
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      totalPages: Math.ceil(total / dto.pageSize),
    };
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
  async findOne({ eventId }: { eventId: string }) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        issue: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
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
  async compareEvents({ eventIds }: { eventIds: string[] }) {
    const events = await this.prisma.event.findMany({
      where: {
        id: { in: eventIds },
      },
      select: {
        id: true,
        type: true,
        subType: true,
        eventData: true,
        breadcrumbs: true,
        requestContext: true,
        device: true,
        network: true,
        userId: true,
        sessionId: true,
        pageUrl: true,
        timestamp: true,
        appVersion: true,
        environment: true,
      },
      orderBy: { timestamp: 'asc' },
    });

    return events;
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
  async getSessionTimeline({ sessionId }: { sessionId: string }) {
    const events = await this.prisma.event.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        type: true,
        subType: true,
        eventData: true,
        breadcrumbs: true,
        pageUrl: true,
        timestamp: true,
        issueId: true,
      },
    });

    return events;
  }
}
