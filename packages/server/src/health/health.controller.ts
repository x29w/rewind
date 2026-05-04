/**
 * 健康检查控制器
 * Health Check Controller
 * ヘルスチェックコントローラー
 * 健康檢查控制器
 */

import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService) {}

  /**
   * 健康检查端点
   * Health check endpoint
   * ヘルスチェックエンドポイント
   * 健康檢查端點
   */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([]);
  }
}
