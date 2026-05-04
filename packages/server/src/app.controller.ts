/**
 * 应用控制器
 * Application Controller
 * アプリケーションコントローラー
 * 應用控制器
 */

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * 根路由
   * Root route
   * ルートルート
   * 根路由
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
