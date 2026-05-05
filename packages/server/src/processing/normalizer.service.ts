/**
 * 标准化服务
 * Normalizer Service
 * 正規化サービス
 * 標準化服務
 */

import { Injectable } from '@nestjs/common';

interface RawEvent {
  type: string;
  subType?: string;
  data: any;
  timestamp: number;
  breadcrumbs?: any[];
}

interface ReportMeta {
  sessionId: string;
  userId?: string;
  pageUrl: string;
  device: any;
  network?: any;
  appVersion?: string;
  environment?: string;
}

interface NormalizedEvent {
  type: string;
  subType?: string;
  eventData: any;
  breadcrumbs: any[];
  requestContext?: any;
  device: any;
  network?: any;
  userId?: string;
  sessionId: string;
  pageUrl: string;
  projectId: string;
  appVersion?: string;
  environment?: string;
  timestamp: Date;
  level: string;
  message: string;
  stack?: string;
}

@Injectable()
export class NormalizerService {
  /**
   * 标准化事件
   * Normalize Event
   * イベントを正規化
   * 標準化事件
   *
   * @description_zh 将原始事件转换为标准格式
   * @description_en Convert raw event to standard format
   * @description_ja 生のイベントを標準形式に変換
   * @description_tw 將原始事件轉換為標準格式
   */
  normalize({
    raw,
    meta,
    projectId,
  }: {
    raw: RawEvent;
    meta: ReportMeta;
    projectId: string;
  }): NormalizedEvent {
    return {
      type: raw.type,
      subType: raw.subType,
      eventData: raw.data,
      breadcrumbs: raw.breadcrumbs || [],
      requestContext: this.extractRequestContext(raw),
      device: meta.device,
      network: meta.network,
      userId: meta.userId,
      sessionId: meta.sessionId,
      pageUrl: meta.pageUrl,
      projectId,
      appVersion: meta.appVersion,
      environment: meta.environment,
      timestamp: new Date(raw.timestamp),
      level: this.determineLevel(raw),
      message: this.extractMessage(raw),
      stack: this.extractStack(raw),
    };
  }

  /**
   * 提取请求上下文
   * Extract Request Context
   * リクエストコンテキストを抽出
   * 提取請求上下文
   */
  private extractRequestContext(raw: RawEvent): any | undefined {
    if (raw.type === 'api_error' && raw.data.request) {
      return {
        method: raw.data.method,
        url: raw.data.url,
        status: raw.data.status,
        request: raw.data.request,
        response: raw.data.response,
      };
    }
    return undefined;
  }

  /**
   * 确定事件级别
   * Determine Event Level
   * イベントレベルを決定
   * 確定事件級別
   */
  private determineLevel(raw: RawEvent): string {
    if (raw.type === 'error' || raw.type === 'blank_screen') {
      return 'error';
    }
    if (raw.type === 'api_error') {
      const status = raw.data.status;
      if (status >= 500) return 'error';
      if (status >= 400) return 'warning';
      return 'info';
    }
    return 'info';
  }

  /**
   * 提取错误消息
   * Extract Error Message
   * エラーメッセージを抽出
   * 提取錯誤訊息
   */
  private extractMessage(raw: RawEvent): string {
    if (raw.type === 'error') {
      return raw.data.message || raw.data.name || 'Unknown Error';
    }
    if (raw.type === 'blank_screen') {
      return 'Blank Screen Detected';
    }
    if (raw.type === 'api_error') {
      return `${raw.data.method} ${raw.data.url} - ${raw.data.status}`;
    }
    return raw.type;
  }

  /**
   * 提取堆栈信息
   * Extract Stack Trace
   * スタックトレースを抽出
   * 提取堆疊資訊
   */
  private extractStack(raw: RawEvent): string | undefined {
    if (raw.type === 'error' && raw.data.stack) {
      return raw.data.stack;
    }
    return undefined;
  }
}
