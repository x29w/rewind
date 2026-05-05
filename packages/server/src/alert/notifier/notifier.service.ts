/**
 * 通知服务
 * Notifier Service
 * 通知サービス
 * 通知服務
 */

import { Injectable } from '@nestjs/common';
import { WebhookNotifier } from './webhook.notifier';
import { EmailNotifier } from './email.notifier';

@Injectable()
export class NotifierService {
  constructor(
    private readonly webhookNotifier: WebhookNotifier,
    private readonly emailNotifier: EmailNotifier,
  ) {}

  /**
   * 发送通知
   * Send Notification
   * 通知を送信
   * 發送通知
   *
   * @description_zh 根据规则配置发送通知到各个渠道
   * @description_en Send notifications to channels based on rule configuration
   * @description_ja ルール設定に基づいて各チャネルに通知を送信
   * @description_tw 根據規則設定發送通知到各個管道
   */
  async notify({
    rule,
    value,
    threshold,
    message,
  }: {
    rule: any;
    value: number;
    threshold: number;
    message: string;
  }): Promise<void> {
    const actions = rule.actions as Array<{
      type: 'webhook' | 'email';
      url?: string;
      to?: string[];
    }>;

    const title = `告警：${rule.name}`;

    const promises = actions.map(async (action) => {
      try {
        if (action.type === 'webhook' && action.url) {
          await this.webhookNotifier.send({
            title,
            message,
            url: action.url,
          });
        } else if (action.type === 'email' && action.to) {
          await this.emailNotifier.send({
            title,
            message,
            to: action.to,
          });
        }
      } catch (error) {
        console.error(`Failed to send ${action.type} notification:`, error);
      }
    });

    await Promise.allSettled(promises);
  }
}
