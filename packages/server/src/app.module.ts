/**
 * 应用主模块
 * Application Main Module
 * アプリケーションメインモジュール
 * 應用主模組
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { IssueModule } from './issue/issue.module';
import { EventModule } from './event/event.module';
import { SourcemapModule } from './sourcemap/sourcemap.module';
import { ProcessingModule } from './processing/processing.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { AiModule } from './ai/ai.module';
import { AlertModule } from './alert/alert.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    TerminusModule,
    PrismaModule,
    CacheModule,
    AuthModule,
    ProjectModule,
    IssueModule,
    EventModule,
    SourcemapModule,
    ProcessingModule,
    IngestionModule,
    AiModule,
    AlertModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
