/**
 * 处理器（BullMQ Worker）
 * Processing Processor (BullMQ Worker)
 * プロセッサー（BullMQ ワーカー）
 * 處理器（BullMQ Worker）
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { NormalizerService } from './normalizer.service';
import { FingerprintService } from '../issue/fingerprint.service';
import { IssueService } from '../issue/issue.service';
import { EventService } from '../event/event.service';
import { StackResolverService } from '../sourcemap/stack-resolver.service';

interface RawEvent {
  type: string;
  subType?: string;
  data: any;
  timestamp: number;
  breadcrumbs?: any[];
}

interface ReportMeta {
  sessionId: string;
  userId?: string;
  pageUrl: string;
  device: any;
  network?: any;
  appVersion?: string;
  environment?: string;
}

@Processor('event-processing')
@Injectable()
export class ProcessingProcessor extends WorkerHost {
  constructor(
    private readonly normalizer: NormalizerService,
    private readonly fingerprint: FingerprintService,
    private readonly issueService: IssueService,
    private readonly eventService: EventService,
    private readonly stackResolver: StackResolverService,
  ) {
    super();
  }

  /**
   * 处理事件
   * Process Events
   * イベントを処理
   * 處理事件
   *
   * @description_zh 执行完整的数据处理管线
   * @description_en Execute complete data processing pipeline
   * @description_ja 完全なデータ処理パイプラインを実行
   * @description_tw 執行完整的資料處理管線
   */
  async process(
    job: Job<{
      events: RawEvent[];
      meta: ReportMeta;
      projectId: string;
    }>,
  ): Promise<void> {
    const { events, meta, projectId } = job.data;

    for (const raw of events) {
      try {
        // ① 标准化
        const event = this.normalizer.normalize({ raw, meta, projectId });

        // ② SourceMap 还原（仅错误类事件）
        if (this.isErrorType(event.type) && event.stack && meta.appVersion) {
          try {
            const resolvedStack = await this.stackResolver.resolve({
              stack: event.stack,
              appVersion: meta.appVersion,
              projectId,
            });
            event.eventData.resolvedStack = resolvedStack;
          } catch (error) {
            console.error('Failed to resolve stack:', error);
          }
        }

        // ③ 指纹计算 + ④ Issue 归并（仅错误类事件）
        let issueId: string | undefined;
        if (this.isErrorType(event.type)) {
          const fingerprintHash = this.fingerprint.compute({
            eventData: {
              type: event.type,
              subType: event.subType,
              message: event.message,
              stack: event.eventData.resolvedStack || event.stack,
              method: event.eventData.method,
              url: event.eventData.url,
              status: event.eventData.status,
            },
          });

          const issue = await this.issueService.upsertByFingerprint({
            projectId,
            fingerprint: fingerprintHash,
            event: {
              type: event.type,
              subType: event.subType,
              message: event.message,
              stack: event.stack,
              level: event.level,
              timestamp: event.timestamp,
              userId: event.userId,
              appVersion: event.appVersion,
              environment: event.environment,
            },
          });

          issueId = issue.id;
        }

        // ⑤ 存储事件
        await this.eventService.create({
          eventData: {
            issueId,
            type: event.type,
            subType: event.subType,
            eventData: event.eventData,
            breadcrumbs: event.breadcrumbs,
            requestContext: event.requestContext,
            device: event.device,
            network: event.network,
            userId: event.userId,
            sessionId: event.sessionId,
            pageUrl: event.pageUrl,
            projectId: event.projectId,
            appVersion: event.appVersion,
            environment: event.environment,
            timestamp: event.timestamp,
          },
        });

        // ⑥ 性能聚合（TODO: 在 PerformanceModule 中实现）
        // ⑦ 告警检测（TODO: 在 AlertModule 中实现）
      } catch (error) {
        console.error('Failed to process event:', error);
        throw error; // 让 BullMQ 重试
      }
    }
  }

  /**
   * 判断是否为错误类事件
   * Check if Error Type Event
   * エラータイプのイベントかどうかを確認
   * 判斷是否為錯誤類事件
   */
  private isErrorType(type: string): boolean {
    return ['error', 'blank_screen', 'api_error'].includes(type);
  }
}
