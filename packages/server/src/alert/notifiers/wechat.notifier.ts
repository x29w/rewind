/**
 * 企业微信通知器
 * WeChat Work Notifier
 * WeChat Work 通知
 * 企業微信通知器
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AlertEvent } from '../alert.service';

@Injectable()
export class WechatNotifier {
  private readonly logger = new Logger(WechatNotifier.name);

  constructor(private readonly configService: ConfigService) {}

  async send(event: AlertEvent): Promise<void> {
    const webhookUrl = this.configService.get<string>('WECHAT_WEBHOOK_URL');

    if (!webhookUrl) {
      this.logger.warn('WeChat webhook URL not configured');
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msgtype: 'markdown',
          markdown: {
            content: this.buildMarkdown(event),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`WeChat webhook returned ${response.status}`);
      }

      this.logger.log(`WeChat alert sent for issue ${event.issueId}`);
    } catch (error) {
      this.logger.error(`Failed to send WeChat alert: ${error.message}`);
    }
  }

  private buildMarkdown(event: AlertEvent): string {
    return `
# 🚨 Rewind 告警

**级别**: <font color="warning">${event.level.toUpperCase()}</font>
**标题**: ${event.title}
**消息**: ${event.message}
**事件数**: ${event.eventCount}
**影响用户**: ${event.userCount}

[查看详情](${event.url})
    `.trim();
  }
}
