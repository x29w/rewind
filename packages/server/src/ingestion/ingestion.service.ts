/**
 * Ingestion 服务
 * Ingestion Service
 * Ingestion サービス
 * Ingestion 服務
 */

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';
import { PipelineService } from '../processing/pipeline.service';
import { ReportDto } from './dto';

@Injectable()
export class IngestionService {
  constructor(
    private readonly rateLimiter: RateLimiterService,
    private readonly pipeline: PipelineService,
  ) {}

  /**
   * 处理上报数据
   * Process Report
   * レポートを処理
   * 處理上報資料
   *
   * @description_zh 验证限流后将事件加入处理队列
   * @description_en Validate rate limit and enqueue events for processing
   * @description_ja レート制限を検証し、イベントを処理キューに追加
   * @description_tw 驗證限流後將事件加入處理佇列
   */
  async process({
    dto,
    projectId,
  }: {
    dto: ReportDto;
    projectId: string;
  }): Promise<void> {
    // 限流检查
    const allowed = await this.rateLimiter.check({ projectId });
    if (!allowed) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }

    // 基本验证
    if (!dto.events || dto.events.length === 0) {
      throw new HttpException('No events provided', HttpStatus.BAD_REQUEST);
    }

    if (dto.events.length > 100) {
      throw new HttpException(
        'Too many events (max 100 per request)',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 加入处理队列
    await this.pipeline.enqueue({
      events: dto.events,
      meta: {
        sessionId: dto.sessionId,
        userId: dto.userId,
        pageUrl: dto.pageUrl,
        device: dto.device,
        network: dto.network,
        appVersion: dto.appVersion,
        environment: dto.environment,
      },
      projectId,
    });
  }
}
