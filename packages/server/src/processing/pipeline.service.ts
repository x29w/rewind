/**
 * 管线服务
 * Pipeline Service
 * パイプラインサービス
 * 管線服務
 */

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

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

@Injectable()
export class PipelineService {
  constructor(
    @InjectQueue('event-processing')
    private readonly processingQueue: Queue,
  ) {}

  /**
   * 将事件加入处理队列
   * Enqueue Events for Processing
   * イベントを処理キューに追加
   * 將事件加入處理佇列
   *
   * @description_zh 将原始事件加入 BullMQ 队列，异步处理
   * @description_en Add raw events to BullMQ queue for async processing
   * @description_ja 生のイベントを BullMQ キューに追加し、非同期処理
   * @description_tw 將原始事件加入 BullMQ 佇列，非同步處理
   */
  async enqueue({
    events,
    meta,
    projectId,
  }: {
    events: RawEvent[];
    meta: ReportMeta;
    projectId: string;
  }): Promise<void> {
    await this.processingQueue.add(
      'process-events',
      {
        events,
        meta,
        projectId,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );
  }
}
