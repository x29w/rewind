/**
 * Sourcemap 模块
 * Sourcemap Module
 * Sourcemap モジュール
 * Sourcemap 模組
 */

import { Module } from '@nestjs/common';
import { SourcemapController } from './sourcemap.controller';
import { SourcemapService } from './sourcemap.service';
import { StackResolverService } from './stack-resolver.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SourcemapController],
  providers: [SourcemapService, StackResolverService],
  exports: [SourcemapService, StackResolverService],
})
export class SourcemapModule {}
