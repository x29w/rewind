/**
 * Prisma 模块
 * Prisma Module
 * Prisma モジュール
 * Prisma 模組
 */

import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
