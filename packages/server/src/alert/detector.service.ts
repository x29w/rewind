/**
 * 告警检测服务
 * Alert Detector Service
 * アラート検出サービス
 * 告警檢測服務
 */

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertService } from './alert.service';
import { NotifierService } from './notifier/notifier.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DetectorService {
  constructor(
    private readonly alertService: AlertService,
    private readonly notifier: NotifierService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 定时检测告警
   * Detect Alerts Periodically
   * 定期的にアラートを検出
   * 定時檢測告警
   *
   * @description_zh 每分钟执行一次告警检测
   * @description_en Execute alert detection every minute
   * @description_ja 毎分アラート検出を実行
   * @description_tw 每分鐘執行一次告警檢測
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async detect() {
    const rules = await this.alertService.getEnabledRules();

    for (const rule of rules) {
      try {
        // 检查静默期
        if (this.isInSilencePeriod(rule)) {
          continue;
        }

        // 计算指标值
        const value = await this.computeMetric({
          projectId: rule.projectId,
          metric: rule.metric,
          filters: rule.filters,
          window: (rule.condition as any).window,
        });

        // 判断是否触发
        if (this.evaluate({ value, condition: rule.condition as any })) {
          await this.trigger({ rule, value });
        }
      } catch (error) {
        console.error(`Failed to detect alert for rule ${rule.id}:`, error);
      }
    }
  }

  /**
   * 检查是否在静默期
   * Check if in Silence Period
   * サイレンス期間かどうかを確認
   * 檢查是否在靜默期
   */
  private isInSilencePeriod(rule: any): boolean {
    if (!rule.lastTriggered) {
      return false;
    }

    const elapsed = Date.now() - rule.lastTriggered.getTime();
    return elapsed < rule.silencePeriod * 1000;
  }

  /**
   * 计算指标值
   * Compute Metric Value
   * メトリック値を計算
   * 計算指標值
   */
  private async computeMetric({
    projectId,
    metric,
    filters,
    window,
  }: {
    projectId: string;
    metric: string;
    filters: any;
    window: string;
  }): Promise<number> {
    const windowMs = this.parseWindow(window);
    const startTime = new Date(Date.now() - windowMs);

    const where: any = {
      projectId,
      createdAt: { gte: startTime },
    };

    // 应用过滤器
    if (filters?.environment) {
      where.environment = filters.environment;
    }

    switch (metric) {
      case 'error_count':
        return this.prisma.event.count({
          where: {
            ...where,
            type: { in: ['error', 'blank_screen', 'api_error'] },
          },
        });

      case 'new_issue_count':
        return this.prisma.issue.count({
          where: {
            projectId,
            firstSeen: { gte: startTime },
            ...(filters?.environment && { environment: filters.environment }),
          },
        });

      case 'blank_screen_count':
        return this.prisma.event.count({
          where: {
            ...where,
            type: 'blank_screen',
          },
        });

      case 'api_error_rate': {
        const [errorCount, totalCount] = await Promise.all([
          this.prisma.event.count({
            where: {
              ...where,
              type: 'api_error',
            },
          }),
          this.prisma.event.count({
            where: {
              ...where,
              type: { in: ['api_error', 'api_success'] },
            },
          }),
        ]);
        return totalCount > 0 ? (errorCount / totalCount) * 100 : 0;
      }

      case 'lcp_p75': {
        // 简化实现，实际应该从 performance_aggregations 表查询
        const events = await this.prisma.event.findMany({
          where: {
            ...where,
            type: 'performance',
          },
          select: {
            eventData: true,
          },
        });

        const lcpValues = events
          .map((e: any) => e.eventData?.lcp)
          .filter((v: any) => typeof v === 'number')
          .sort((a: number, b: number) => a - b);

        if (lcpValues.length === 0) return 0;

        const p75Index = Math.floor(lcpValues.length * 0.75);
        return lcpValues[p75Index];
      }

      default:
        return 0;
    }
  }

  /**
   * 评估条件
   * Evaluate Condition
   * 条件を評価
   * 評估條件
   */
  private evaluate({
    value,
    condition,
  }: {
    value: number;
    condition: {
      operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
      threshold: number;
    };
  }): boolean {
    switch (condition.operator) {
      case 'gt':
        return value > condition.threshold;
      case 'lt':
        return value < condition.threshold;
      case 'gte':
        return value >= condition.threshold;
      case 'lte':
        return value <= condition.threshold;
      case 'eq':
        return value === condition.threshold;
      default:
        return false;
    }
  }

  /**
   * 触发告警
   * Trigger Alert
   * アラートをトリガー
   * 觸發告警
   */
  private async trigger({ rule, value }: { rule: any; value: number }) {
    const threshold = (rule.condition as any).threshold;
    const message = this.formatMessage({ rule, value, threshold });

    // 创建历史记录
    const history = await this.alertService.createHistory({
      ruleId: rule.id,
      projectId: rule.projectId,
      metric: rule.metric,
      value,
      threshold,
      message,
    });

    // 更新最后触发时间
    await this.alertService.updateLastTriggered({ ruleId: rule.id });

    // 发送通知
    try {
      await this.notifier.notify({
        rule,
        value,
        threshold,
        message,
      });

      // 标记已通知
      await this.alertService.markNotified({ historyId: history.id });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * 格式化告警消息
   * Format Alert Message
   * アラートメッセージをフォーマット
   * 格式化告警訊息
   */
  private formatMessage({
    rule,
    value,
    threshold,
  }: {
    rule: any;
    value: number;
    threshold: number;
  }): string {
    const metricNames: Record<string, string> = {
      error_count: '错误数量',
      new_issue_count: '新问题数量',
      blank_screen_count: '白屏数量',
      api_error_rate: 'API 错误率',
      lcp_p75: 'LCP P75',
    };

    const metricName = metricNames[rule.metric] || rule.metric;
    const valueStr =
      rule.metric === 'api_error_rate' ? `${value.toFixed(2)}%` : value;
    const thresholdStr =
      rule.metric === 'api_error_rate' ? `${threshold}%` : threshold;

    return `【${rule.project.name}】${rule.name}: ${metricName} 当前值 ${valueStr}，超过阈值 ${thresholdStr}`;
  }

  /**
   * 解析时间窗口
   * Parse Time Window
   * 時間ウィンドウを解析
   * 解析時間視窗
   */
  private parseWindow(window: string): number {
    const match = window.match(/^(\d+)([mhd])$/);
    if (!match) return 5 * 60 * 1000; // 默认 5 分钟

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 5 * 60 * 1000;
    }
  }
}
