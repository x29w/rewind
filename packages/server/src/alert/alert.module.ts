/**
 * Alert 模块
 * Alert Module
 * Alert モジュール
 * Alert 模組
 */

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';
import { DetectorService } from './detector.service';
import { NotifierService } from './notifier/notifier.service';
import { WebhookNotifier } from './notifier/webhook.notifier';
import { EmailNotifier } from './notifier/email.notifier';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  controllers: [AlertController],
  providers: [
    AlertService,
    DetectorService,
    NotifierService,
    WebhookNotifier,
    EmailNotifier,
  ],
  exports: [AlertService],
})
export class AlertModule {}
