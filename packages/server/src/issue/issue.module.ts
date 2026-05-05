/**
 * Issue 模块
 * Issue Module
 * Issue モジュール
 * Issue 模組
 */

import { Module } from '@nestjs/common';
import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';
import { FingerprintService } from './fingerprint.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IssueController],
  providers: [IssueService, FingerprintService],
  exports: [IssueService, FingerprintService],
})
export class IssueModule {}
