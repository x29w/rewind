/**
 * 限流服务
 * Rate Limiter Service
 * レート制限サービス
 * 限流服務
 */

import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class RateLimiterService {
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(private readonly cache: CacheService) {
    this.windowMs = parseInt(process.env.RATE_LIMIT_TTL || '60000', 10);
    this.maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '1000', 10);
  }

  /**
   * 检查是否超过限流
   * Check Rate Limit
   * レート制限をチェック
   * 檢查是否超過限流
   *
   * @description_zh 使用 Redis 滑动窗口算法检查请求频率
   * @description_en Check request rate using Redis sliding window algorithm
   * @description_ja Redis スライディングウィンドウアルゴリズムを使用してリクエスト頻度をチェック
   * @description_tw 使用 Redis 滑動視窗演算法檢查請求頻率
   */
  async check({ projectId }: { projectId: string }): Promise<boolean> {
    const key = `rate:${projectId}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const redis = this.cache.getClient();

    // 使用 Redis pipeline 提高性能
    const pipeline = redis.pipeline();

    // 1. 删除窗口外的记录
    pipeline.zremrangebyscore(key, 0, windowStart);

    // 2. 添加当前请求
    pipeline.zadd(key, now, `${now}:${Math.random()}`);

    // 3. 统计窗口内的请求数
    pipeline.zcard(key);

    // 4. 设置过期时间
    pipeline.expire(key, Math.ceil(this.windowMs / 1000));

    const results = await pipeline.exec();

    // 获取请求数（第3个命令的结果）
    const count = results?.[2]?.[1] as number;

    return count <= this.maxRequests;
  }

  /**
   * 获取当前请求数
   * Get Current Count
   * 現在のリクエスト数を取得
   * 取得目前請求數
   */
  async getCount({ projectId }: { projectId: string }): Promise<number> {
    const key = `rate:${projectId}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const redis = this.cache.getClient();

    // 清理过期记录
    await redis.zremrangebyscore(key, 0, windowStart);

    // 获取当前计数
    return redis.zcard(key);
  }
}
