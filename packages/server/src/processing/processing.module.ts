/**
 * Processing 模块
 * Processing Module
 * Processing モジュール
 * Processing 模組
 */

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ProcessingProcessor } from './processing.processor';
import { NormalizerService } from './normalizer.service';
import { PipelineService } from './pipeline.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IssueModule } from '../issue/issue.module';
import { EventModule } from '../event/event.module';
import { SourcemapModule } from '../sourcemap/sourcemap.module';
import { PerformanceModule } from '../performance/performance.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'event-processing',
    }),
    PrismaModule,
    IssueModule,
    EventModule,
    SourcemapModule,
    PerformanceModule,
  ],
  providers: [ProcessingProcessor, NormalizerService, PipelineService],
  exports: [PipelineService],
})
export class ProcessingModule {}
