/**
 * Ingestion 控制器
 * Ingestion Controller
 * Ingestion コントローラー
 * Ingestion 控制器
 */

import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { ReportDto } from './dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { CurrentProject } from '../common/decorators/current-project.decorator';

@Controller('api/v1')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  /**
   * 接收 SDK 上报数据
   * Receive SDK Report
   * SDK レポートを受信
   * 接收 SDK 上報資料
   *
   * @description_zh 接收 SDK 上报的事件数据，验证后加入处理队列
   * @description_en Receive event data from SDK, validate and enqueue for processing
   * @description_ja SDK からのイベントデータを受信し、検証後に処理キューに追加
   * @description_tw 接收 SDK 上報的事件資料，驗證後加入處理佇列
   */
  @Post('report')
  @UseGuards(ApiKeyGuard)
  @HttpCode(204)
  async report(
    @Body() dto: ReportDto,
    @CurrentProject() project: { id: string; name: string; settings: any },
  ) {
    try {
      await this.ingestionService.process({ dto, projectId: project.id });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Failed to process report:', error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
