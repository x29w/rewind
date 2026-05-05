/**
 * 告警服务
 * Alert Service
 * アラートサービス
 * 告警服務
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailNotifier } from './notifiers/email.notifier';
import { WebhookNotifier } from './notifiers/webhook.notifier';
import { WechatNotifier } from './notifiers/wechat.notifier';
import { DingtalkNotifier } from './notifiers/dingtalk.notifier';

export interface AlertRule {
  id: string;
  name: string;
  type: 'error_count' | 'error_rate' | 'new_error' | 'regression';
  threshold?: number;
  timeWindow?: number;
  channels: string[];
  enabled: boolean;
}

export interface AlertEvent {
  issueId: string;
  title: string;
  message: string;
  level: string;
  eventCount: number;
  userCount: number;
  url: string;
}

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailNotifier: EmailNotifier,
    private readonly webhookNotifier: WebhookNotifier,
    private readonly wechatNotifier: WechatNotifier,
    private readonly dingtalkNotifier: DingtalkNotifier,
  ) {}

  /**
   * 检查告警规则
   * Check alert rules
   * アラートルールをチェック
   * 檢查告警規則
   */
  async checkAlertRules(issueId: string): Promise<void> {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) return;

    // 模拟告警规则检查
    // Simulate alert rule checking
    // アラートルールチェックをシミュレート
    // 模擬告警規則檢查
    const shouldAlert = this.shouldTriggerAlert(issue);

    if (shouldAlert) {
      await this.sendAlert({
        issueId: issue.id,
        title: issue.title,
        message: issue.message,
        level: issue.level,
        eventCount: issue.eventCount,
        userCount: issue.userCount,
        url: `https://rewind.example.com/issues/${issue.id}`,
      });
    }
  }

  /**
   * 发送告警
   * Send alert
   * アラートを送信
   * 發送告警
   */
  async sendAlert(event: AlertEvent): Promise<void> {
    const channels = ['email', 'webhook']; // 从配置读取
    // Read from configuration
    // 設定から読み取る
    // 從配置讀取

    const promises = channels.map((channel) => {
      switch (channel) {
        case 'email':
          return this.emailNotifier.send(event);
        case 'webhook':
          return this.webhookNotifier.send(event);
        case 'wechat':
          return this.wechatNotifier.send(event);
        case 'dingtalk':
          return this.dingtalkNotifier.send(event);
        default:
          return Promise.resolve();
      }
    });

    try {
      await Promise.allSettled(promises);
      this.logger.log(`Alert sent for issue ${event.issueId}`);
    } catch (error) {
      this.logger.error(`Failed to send alert: ${error.message}`);
    }
  }

  /**
   * 判断是否触发告警
   * Check if should trigger alert
   * アラートをトリガーすべきかチェック
   * 判斷是否觸發告警
   */
  private shouldTriggerAlert(issue: any): boolean {
    // 错误数量超过阈值
    // Error count exceeds threshold
    // エラー数がしきい値を超える
    // 錯誤數量超過閾值
    if (issue.eventCount > 100) return true;

    // 新错误
    // New error
    // 新しいエラー
    // 新錯誤
    if (issue.eventCount === 1) return true;

    // 严重级别
    // Critical level
    // 重大レベル
    // 嚴重級別
    if (issue.level === 'fatal') return true;

    return false;
  }
}
