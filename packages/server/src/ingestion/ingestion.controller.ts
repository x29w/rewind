/**
 * 数据接收控制器
 * Ingestion Controller
 * データ取り込みコントローラー
 * 資料接收控制器
 */

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { ReportEventDto } from './dto/report-event.dto';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { Throttle } from '@nestjs/throttler';

/**
 * 数据接收控制器
 * Ingestion Controller
 * データ取り込みコントローラー
 * 資料接收控制器
 */
@Controller('api/v1')
@UseGuards(ApiKeyGuard)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  /**
   * 接收事件上报
   * Receive event report
   * イベントレポートを受信
   * 接收事件上報
   * 
   * @param event - 事件数据 / Event data / イベントデータ / 事件資料
   * @param apiKey - API 密钥 / API key / API キー / API 金鑰
   */
  @Post('report')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 requests per minute
  async report(
    @Body() event: ReportEventDto,
    @Headers('x-api-key') apiKey: string,
  ): Promise<{ success: boolean; eventId?: string }> {
    const eventId = await this.ingestionService.processEvent(event, apiKey);
    return { success: true, eventId };
  }

  /**
   * 批量接收事件
   * Batch receive events
   * イベントをバッチ受信
   * 批次接收事件
   * 
   * @param events - 事件数组 / Event array / イベント配列 / 事件陣列
   * @param apiKey - API 密钥 / API key / API キー / API 金鑰
   */
  @Post('report/batch')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 batch requests per minute
  async reportBatch(
    @Body() events: ReportEventDto[],
    @Headers('x-api-key') apiKey: string,
  ): Promise<{ success: boolean; count: number }> {
    const count = await this.ingestionService.processBatch(events, apiKey);
    return { success: true, count };
  }
}
