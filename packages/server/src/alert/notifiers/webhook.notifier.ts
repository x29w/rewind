/**
 * Webhook 通知器
 * Webhook Notifier
 * Webhook 通知
 * Webhook 通知器
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AlertEvent } from '../alert.service';

@Injectable()
export class WebhookNotifier {
  private readonly logger = new Logger(WebhookNotifier.name);

  constructor(private readonly configService: ConfigService) {}

  async send(event: AlertEvent): Promise<void> {
    const webhookUrl = this.configService.get<string>('WEBHOOK_URL');

    if (!webhookUrl) {
      this.logger.warn('Webhook URL not configured');
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'alert',
          event,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
      }

      this.logger.log(`Webhook alert sent for issue ${event.issueId}`);
    } catch (error) {
      this.logger.error(`Failed to send webhook alert: ${error.message}`);
    }
  }
}
