/**
 * 告警控制器
 * Alert Controller
 * アラートコントローラー
 * 告警控制器
 */

import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { AlertService } from './alert.service';
import { ApiKeyGuard } from '../guards/api-key.guard';

@Controller('api/v1/alerts')
@UseGuards(ApiKeyGuard)
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  /**
   * 测试告警
   * Test alert
   * アラートをテスト
   * 測試告警
   */
  @Post('test')
  async testAlert(@Body() body: { channel: string }) {
    const testEvent = {
      issueId: 'test-123',
      title: 'Test Alert',
      message: 'This is a test alert',
      level: 'error',
      eventCount: 1,
      userCount: 1,
      url: 'https://rewind.example.com/issues/test-123',
    };

    await this.alertService.sendAlert(testEvent);

    return {
      success: true,
      message: 'Test alert sent',
    };
  }

  /**
   * 手动触发告警
   * Manually trigger alert
   * 手動でアラートをトリガー
   * 手動觸發告警
   */
  @Post('trigger/:issueId')
  async triggerAlert(@Param('issueId') issueId: string) {
    await this.alertService.checkAlertRules(issueId);

    return {
      success: true,
      message: 'Alert check triggered',
    };
  }
}
