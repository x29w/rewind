/**
 * 钉钉通知器
 * DingTalk Notifier
 * DingTalk 通知
 * 釘釘通知器
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AlertEvent } from '../alert.service';

@Injectable()
export class DingtalkNotifier {
  private readonly logger = new Logger(DingtalkNotifier.name);

  constructor(private readonly configService: ConfigService) {}

  async send(event: AlertEvent): Promise<void> {
    const webhookUrl = this.configService.get<string>('DINGTALK_WEBHOOK_URL');

    if (!webhookUrl) {
      this.logger.warn('DingTalk webhook URL not configured');
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msgtype: 'markdown',
          markdown: {
            title: `Rewind 告警: ${event.title}`,
            text: this.buildMarkdown(event),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`DingTalk webhook returned ${response.status}`);
      }

      this.logger.log(`DingTalk alert sent for issue ${event.issueId}`);
    } catch (error) {
      this.logger.error(`Failed to send DingTalk alert: ${error.message}`);
    }
  }

  private buildMarkdown(event: AlertEvent): string {
    return `
### 🚨 Rewind 告警

**级别**: ${event.level.toUpperCase()}

**标题**: ${event.title}

**消息**: ${event.message}

**事件数**: ${event.eventCount}

**影响用户**: ${event.userCount}

[查看详情](${event.url})
    `.trim();
  }
}
