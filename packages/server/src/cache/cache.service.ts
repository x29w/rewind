/**
 * 缓存服务 - 内存缓存实现
 * Cache Service - In-memory Cache Implementation
 * キャッシュサービス - インメモリキャッシュ実装
 * 快取服務 - 記憶體快取實現
 */

import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * 获取缓存值
   * Get cached value
   * キャッシュ値を取得
   * 獲取快取值
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired: ${key}`);
      return null;
    }

    this.logger.debug(`Cache hit: ${key}`);
    return entry.value as T;
  }

  /**
   * 设置缓存值
   * Set cache value
   * キャッシュ値を設定
   * 設定快取值
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      value,
      expiresAt,
    });

    this.logger.debug(`Cache set: ${key} (TTL: ${ttl || this.defaultTTL}ms)`);
  }

  /**
   * 删除缓存值
   * Delete cache value
   * キャッシュ値を削除
   * 刪除快取值
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.logger.debug(`Cache deleted: ${key}`);
  }

  /**
   * 清空所有缓存
   * Clear all cache
   * すべてのキャッシュをクリア
   * 清空所有快取
   */
  clear(): void {
    this.cache.clear();
    this.logger.debug('Cache cleared');
  }

  /**
   * 获取缓存大小
   * Get cache size
   * キャッシュサイズを取得
   * 獲取快取大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 检查缓存是否存在
   * Check if cache exists
   * キャッシュが存在するか確認
   * 檢查快取是否存在
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 获取或设置缓存（如果不存在则执行回调）
   * Get or set cache (execute callback if not exists)
   * キャッシュを取得または設定（存在しない場合はコールバックを実行）
   * 獲取或設定快取（如果不存在則執行回調）
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    
    return value;
  }

  /**
   * 清理过期缓存
   * Clean expired cache
   * 期限切れのキャッシュをクリーンアップ
   * 清理過期快取
   */
  cleanExpired(): void {
    const now = Date.now();
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }

    if (count > 0) {
      this.logger.debug(`Cleaned ${count} expired cache entries`);
    }
  }
}
