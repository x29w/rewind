/**
 * Issue 服务
 * Issue Service
 * Issue サービス
 * Issue 服務
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryIssuesDto, UpdateIssueStatusDto } from './dto';

interface NormalizedEvent {
  type: string;
  subType?: string;
  message: string;
  stack?: string;
  level: string;
  timestamp: Date;
  userId?: string;
  appVersion?: string;
  environment?: string;
}

@Injectable()
export class IssueService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 根据指纹归并 Issue
   * Upsert Issue by Fingerprint
   * フィンガープリントで Issue をマージ
   * 根據指紋歸併 Issue
   *
   * @description_zh 如果指纹已存在则更新计数，否则创建新 Issue
   * @description_en Update counts if fingerprint exists, otherwise create new Issue
   * @description_ja フィンガープリントが存在する場合はカウントを更新し、そうでない場合は新しい Issue を作成
   * @description_tw 如果指紋已存在則更新計數，否則建立新 Issue
   */
  async upsertByFingerprint({
    projectId,
    fingerprint,
    event,
  }: {
    projectId: string;
    fingerprint: string;
    event: NormalizedEvent;
  }) {
    return this.prisma.$transaction(async (tx) => {
      let issue = await tx.issue.findUnique({
        where: {
          projectId_fingerprint: {
            projectId,
            fingerprint,
          },
        },
      });

      if (!issue) {
        // 创建新 Issue
        issue = await tx.issue.create({
          data: {
            projectId,
            fingerprint,
            type: event.subType || event.type,
            level: event.level,
            title: this.generateTitle(event),
            message: event.message,
            stack: event.stack,
            status: 'open',
            firstSeen: event.timestamp,
            lastSeen: event.timestamp,
            eventCount: 1,
            userCount: event.userId ? 1 : 0,
            appVersion: event.appVersion,
            environment: event.environment,
          },
        });
      } else {
        // 更新现有 Issue
        const update: any = {
          lastSeen: event.timestamp,
          eventCount: { increment: 1 },
        };

        // 检测回归
        if (issue.status === 'resolved') {
          update.status = 'regressed';
        }

        // 更新用户计数（简化版，实际应该用 HyperLogLog）
        if (event.userId) {
          update.userCount = { increment: 1 };
        }

        issue = await tx.issue.update({
          where: { id: issue.id },
          data: update,
        });
      }

      return issue;
    });
  }

  /**
   * 查询 Issue 列表
   * Query Issues
   * Issue リストを取得
   * 查詢 Issue 列表
   */
  async findAll({ projectId, dto }: { projectId: string; dto: QueryIssuesDto }) {
    const where: any = { projectId };

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.level) {
      where.level = dto.level;
    }

    if (dto.type) {
      where.type = dto.type;
    }

    if (dto.environment) {
      where.environment = dto.environment;
    }

    if (dto.search) {
      where.OR = [
        { title: { contains: dto.search, mode: 'insensitive' } },
        { message: { contains: dto.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.issue.count({ where }),
      this.prisma.issue.findMany({
        where,
        orderBy: this.getOrderBy(dto.sortBy, dto.sortOrder),
        skip: (dto.page - 1) * dto.pageSize,
        take: dto.pageSize,
        select: {
          id: true,
          fingerprint: true,
          type: true,
          level: true,
          status: true,
          title: true,
          message: true,
          eventCount: true,
          userCount: true,
          firstSeen: true,
          lastSeen: true,
          appVersion: true,
          environment: true,
          aiSummary: true,
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
   * 获取 Issue 详情
   * Get Issue Detail
   * Issue 詳細を取得
   * 取得 Issue 詳情
   */
  async findOne({ issueId }: { issueId: string }) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    return issue;
  }

  /**
   * 更新 Issue 状态
   * Update Issue Status
   * Issue ステータスを更新
   * 更新 Issue 狀態
   */
  async updateStatus({
    issueId,
    dto,
  }: {
    issueId: string;
    dto: UpdateIssueStatusDto;
  }) {
    const issue = await this.prisma.issue.update({
      where: { id: issueId },
      data: { status: dto.status },
    });

    return issue;
  }

  /**
   * 获取 Issue 趋势数据
   * Get Issue Trend
   * Issue トレンドを取得
   * 取得 Issue 趨勢數據
   */
  async getTrend({ issueId, days = 7 }: { issueId: string; days?: number }) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await this.prisma.event.groupBy({
      by: ['timestamp'],
      where: {
        issueId,
        timestamp: { gte: startDate },
      },
      _count: true,
    });

    // 按天聚合
    const trendMap = new Map<string, number>();
    events.forEach((e) => {
      const date = e.timestamp.toISOString().split('T')[0];
      trendMap.set(date, (trendMap.get(date) || 0) + e._count);
    });

    return Array.from(trendMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * 获取 Issue 环境分布
   * Get Issue Distribution
   * Issue 分布を取得
   * 取得 Issue 環境分佈
   */
  async getDistribution({ issueId }: { issueId: string }) {
    const events = await this.prisma.event.findMany({
      where: { issueId },
      select: {
        device: true,
        appVersion: true,
        environment: true,
      },
    });

    return {
      browsers: this.countBy(events, (e) => (e.device as any)?.browser || 'Unknown'),
      os: this.countBy(events, (e) => (e.device as any)?.os || 'Unknown'),
      versions: this.countBy(events, (e) => e.appVersion || 'Unknown'),
      environments: this.countBy(events, (e) => e.environment || 'Unknown'),
    };
  }

  /**
   * 生成 Issue 标题
   * Generate Issue Title
   * Issue タイトルを生成
   * 生成 Issue 標題
   */
  private generateTitle(event: NormalizedEvent): string {
    if (event.type === 'api_error') {
      return `API Error: ${event.message}`;
    }
    if (event.type === 'blank_screen') {
      return 'Blank Screen Detected';
    }
    return event.message.slice(0, 100);
  }

  /**
   * 获取排序字段
   * Get Order By
   * ソート順を取得
   * 取得排序欄位
   */
  private getOrderBy(sortBy?: string, sortOrder?: 'asc' | 'desc') {
    const order = sortOrder || 'desc';
    switch (sortBy) {
      case 'firstSeen':
        return { firstSeen: order };
      case 'eventCount':
        return { eventCount: order };
      case 'userCount':
        return { userCount: order };
      default:
        return { lastSeen: order };
    }
  }

  /**
   * 统计分组
   * Count By
   * グループ化してカウント
   * 統計分組
   */
  private countBy<T>(items: T[], fn: (item: T) => string): Record<string, number> {
    const result: Record<string, number> = {};
    items.forEach((item) => {
      const key = fn(item);
      result[key] = (result[key] || 0) + 1;
    });
    return result;
  }
}
