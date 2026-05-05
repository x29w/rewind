/**
 * 缓存模块
 * Cache Module
 * キャッシュモジュール
 * 快取模組
 */

import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
