/**
 * Ingestion 模块
 * Ingestion Module
 * Ingestion モジュール
 * Ingestion 模組
 */

import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { RateLimiterService } from './rate-limiter.service';
import { CacheModule } from '../cache/cache.module';
import { ProcessingModule } from '../processing/processing.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [CacheModule, ProcessingModule, PrismaModule],
  controllers: [IngestionController],
  providers: [IngestionService, RateLimiterService],
  exports: [IngestionService],
})
export class IngestionModule {}
