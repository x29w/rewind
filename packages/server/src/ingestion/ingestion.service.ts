/**
 * 数据接收服务
 * Ingestion Service
 * データ取り込みサービス
 * 資料接收服務
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportEventDto } from './dto/report-event.dto';
import * as crypto from 'crypto';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processEvent(event: ReportEventDto, apiKey: string): Promise<string> {
    try {
      const app = await this.prisma.app.findUnique({
        where: { apiKey },
      });

      if (!app) {
        throw new Error('Invalid API key');
      }

      const fingerprint = this.generateFingerprint(event);
      const issue = await this.findOrCreateIssue(app.id, event, fingerprint);

      const eventRecord = await this.prisma.event.create({
        data: {
          issueId: issue.id,
          appId: app.id,
          eventData: {
            type: event.type,
            level: event.level,
            message: event.message,
            stack: event.stack,
            timestamp: event.timestamp,
            extra: event.extra,
          },
          breadcrumbs: event.breadcrumbs as any,
          device: event.device as any,
          network: (event.network || {}) as any,
          userId: event.userId,
          sessionId: event.sessionId,
          pageUrl: event.pageUrl,
        },
      });

      await this.updateIssueStats(issue.id, event.userId);

      this.logger.log(`Event processed: ${eventRecord.id} for issue: ${issue.id}`);

      return eventRecord.id;
    } catch (error) {
      this.logger.error(`Failed to process event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async processBatch(events: ReportEventDto[], apiKey: string): Promise<number> {
    let successCount = 0;

    for (const event of events) {
      try {
        await this.processEvent(event, apiKey);
        successCount++;
      } catch (error) {
        this.logger.error(`Failed to process event in batch: ${error.message}`);
      }
    }

    return successCount;
  }

  private generateFingerprint(event: ReportEventDto): string {
    const stackLines = event.stack
      ? event.stack.split('\n').slice(0, 5).join('\n')
      : '';

    const fingerprintData = `${event.type}:${event.message}:${stackLines}`;

    return crypto
      .createHash('sha256')
      .update(fingerprintData)
      .digest('hex')
      .substring(0, 32);
  }

  private async findOrCreateIssue(
    appId: string,
    event: ReportEventDto,
    fingerprint: string,
  ) {
    let issue = await this.prisma.issue.findUnique({
      where: {
        appId_fingerprint: {
          appId,
          fingerprint,
        },
      },
    });

    if (!issue) {
      issue = await this.prisma.issue.create({
        data: {
          appId,
          fingerprint,
          type: event.type,
          level: event.level,
          title: this.generateIssueTitle(event),
          message: event.message,
          stack: event.stack,
          appVersion: event.appVersion,
          environment: event.environment,
          tags: (event.tags || {}) as any,
          eventCount: 1,
          userCount: 1,
          firstSeen: new Date(event.timestamp),
          lastSeen: new Date(event.timestamp),
        },
      });

      this.logger.log(`New issue created: ${issue.id}`);
    }

    return issue;
  }

  private async updateIssueStats(issueId: string, userId?: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        events: {
          select: { userId: true },
          distinct: ['userId'],
        },
      },
    });

    if (!issue) return;

    const uniqueUserIds = new Set(
      issue.events.map((e) => e.userId).filter((id) => id !== null),
    );

    await this.prisma.issue.update({
      where: { id: issueId },
      data: {
        eventCount: { increment: 1 },
        userCount: uniqueUserIds.size,
        lastSeen: new Date(),
      },
    });
  }

  private generateIssueTitle(event: ReportEventDto): string {
    if (event.message) {
      return event.message.substring(0, 200);
    }

    if (event.stack) {
      const firstLine = event.stack.split('\n')[0];
      return firstLine.substring(0, 200);
    }

    return `${event.type} - ${event.level}`;
  }
}
