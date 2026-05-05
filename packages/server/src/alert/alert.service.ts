/**
 * Alert 服务
 * Alert Service
 * Alert サービス
 * Alert 服務
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAlertRuleDto,
  UpdateAlertRuleDto,
  QueryAlertRulesDto,
  QueryAlertHistoryDto,
} from './dto';

@Injectable()
export class AlertService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建告警规则
   * Create Alert Rule
   * アラートルールを作成
   * 建立告警規則
   */
  async createRule({
    projectId,
    dto,
  }: {
    projectId: string;
    dto: CreateAlertRuleDto;
  }) {
    return this.prisma.alertRule.create({
      data: {
        projectId,
        name: dto.name,
        description: dto.description,
        metric: dto.metric,
        condition: dto.condition,
        filters: dto.filters,
        actions: dto.actions,
        silencePeriod: dto.silencePeriod || 1800,
        enabled: dto.enabled !== false,
      },
    });
  }

  /**
   * 获取告警规则列表
   * Get Alert Rules
   * アラートルールリストを取得
   * 取得告警規則列表
   */
  async findAllRules({
    projectId,
    dto,
  }: {
    projectId: string;
    dto: QueryAlertRulesDto;
  }) {
    const where: any = { projectId };

    if (dto.enabled !== undefined) {
      where.enabled = dto.enabled;
    }

    return this.prisma.alertRule.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取启用的告警规则
   * Get Enabled Alert Rules
   * 有効なアラートルールを取得
   * 取得啟用的告警規則
   */
  async getEnabledRules() {
    return this.prisma.alertRule.findMany({
      where: { enabled: true },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * 获取告警规则详情
   * Get Alert Rule Detail
   * アラートルール詳細を取得
   * 取得告警規則詳情
   */
  async findOneRule({ ruleId }: { ruleId: string }) {
    const rule = await this.prisma.alertRule.findUnique({
      where: { id: ruleId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!rule) {
      throw new NotFoundException('Alert rule not found');
    }

    return rule;
  }

  /**
   * 更新告警规则
   * Update Alert Rule
   * アラートルールを更新
   * 更新告警規則
   */
  async updateRule({
    ruleId,
    dto,
  }: {
    ruleId: string;
    dto: UpdateAlertRuleDto;
  }) {
    return this.prisma.alertRule.update({
      where: { id: ruleId },
      data: dto,
    });
  }

  /**
   * 删除告警规则
   * Delete Alert Rule
   * アラートルールを削除
   * 刪除告警規則
   */
  async deleteRule({ ruleId }: { ruleId: string }) {
    await this.prisma.alertRule.delete({
      where: { id: ruleId },
    });

    return { message: 'Alert rule deleted successfully' };
  }

  /**
   * 更新最后触发时间
   * Update Last Triggered
   * 最後のトリガー時刻を更新
   * 更新最後觸發時間
   */
  async updateLastTriggered({ ruleId }: { ruleId: string }) {
    return this.prisma.alertRule.update({
      where: { id: ruleId },
      data: { lastTriggered: new Date() },
    });
  }

  /**
   * 创建告警历史记录
   * Create Alert History
   * アラート履歴を作成
   * 建立告警歷史記錄
   */
  async createHistory({
    ruleId,
    projectId,
    metric,
    value,
    threshold,
    message,
  }: {
    ruleId: string;
    projectId: string;
    metric: string;
    value: number;
    threshold: number;
    message: string;
  }) {
    return this.prisma.alertHistory.create({
      data: {
        ruleId,
        projectId,
        metric,
        value,
        threshold,
        message,
        notified: false,
      },
    });
  }

  /**
   * 获取告警历史
   * Get Alert History
   * アラート履歴を取得
   * 取得告警歷史
   */
  async findHistory({
    projectId,
    dto,
  }: {
    projectId: string;
    dto: QueryAlertHistoryDto;
  }) {
    const where: any = { projectId };

    if (dto.ruleId) {
      where.ruleId = dto.ruleId;
    }

    if (dto.startDate || dto.endDate) {
      where.triggeredAt = {};
      if (dto.startDate) {
        where.triggeredAt.gte = new Date(dto.startDate);
      }
      if (dto.endDate) {
        where.triggeredAt.lte = new Date(dto.endDate);
      }
    }

    const [total, items] = await Promise.all([
      this.prisma.alertHistory.count({ where }),
      this.prisma.alertHistory.findMany({
        where,
        orderBy: { triggeredAt: 'desc' },
        skip: (dto.page - 1) * dto.pageSize,
        take: dto.pageSize,
        include: {
          rule: {
            select: {
              id: true,
              name: true,
            },
          },
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
   * 标记告警已通知
   * Mark Alert as Notified
   * アラートを通知済みとしてマーク
   * 標記告警已通知
   */
  async markNotified({ historyId }: { historyId: string }) {
    return this.prisma.alertHistory.update({
      where: { id: historyId },
      data: {
        notified: true,
        notifiedAt: new Date(),
      },
    });
  }
}
