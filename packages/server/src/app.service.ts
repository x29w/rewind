/**
 * 应用服务
 * Application Service
 * アプリケーションサービス
 * 應用服務
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * 获取欢迎消息
   * Get welcome message
   * ウェルカムメッセージを取得
   * 獲取歡迎訊息
   */
  getHello(): string {
    return 'Rewind Server is running!';
  }
}
