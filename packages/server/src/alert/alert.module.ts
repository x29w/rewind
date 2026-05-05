/**
 * 告警模块
 * Alert Module
 * アラートモジュール
 * 告警模組
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { EmailNotifier } from './notifiers/email.notifier';
import { WebhookNotifier } from './notifiers/webhook.notifier';
import { WechatNotifier } from './notifiers/wechat.notifier';
import { DingtalkNotifier } from './notifiers/dingtalk.notifier';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AlertController],
  providers: [
    AlertService,
    EmailNotifier,
    WebhookNotifier,
    WechatNotifier,
    DingtalkNotifier,
  ],
  exports: [AlertService],
})
export class AlertModule {}
