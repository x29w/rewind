/**
 * Webhook 通知器
 * Webhook Notifier
 * Webhook 通知
 * Webhook 通知器
 */

import { Injectable } from '@nestjs/common';
import { INotifier } from './notifier.interface';

@Injectable()
export class WebhookNotifier implements INotifier {
  /**
   * 发送 Webhook 通知
   * Send Webhook Notification
   * Webhook 通知を送信
   * 發送 Webhook 通知
   *
   * @description_zh 支持飞书、钉钉、Slack 等 Webhook
   * @description_en Support Feishu, DingTalk, Slack webhooks
   * @description_ja 飛書、DingTalk、Slack などの Webhook をサポート
   * @description_tw 支援飛書、釘釘、Slack 等 Webhook
   */
  async send({
    title,
    message,
    url,
  }: {
    title: string;
    message: string;
    url?: string;
  }): Promise<void> {
    if (!url) {
      throw new Error('Webhook URL is required');
    }

    const payload = this.formatPayload({ title, message, url });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.statusText}`);
    }
  }

  /**
   * 格式化 Payload
   * Format Payload
   * ペイロードをフォーマット
   * 格式化 Payload
   */
  private formatPayload({
    title,
    message,
    url,
  }: {
    title: string;
    message: string;
    url: string;
  }): any {
    // 根据 URL 判断平台类型
    if (url.includes('feishu') || url.includes('lark')) {
      // 飞书格式
      return {
        msg_type: 'text',
        content: {
          text: `${title}\n${message}`,
        },
      };
    }

    if (url.includes('dingtalk')) {
      // 钉钉格式
      return {
        msgtype: 'text',
        text: {
          content: `${title}\n${message}`,
        },
      };
    }

    if (url.includes('slack')) {
      // Slack 格式
      return {
        text: `*${title}*\n${message}`,
      };
    }

    // 通用格式
    return {
      title,
      message,
    };
  }
}
