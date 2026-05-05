/**
 * 指纹计算服务
 * Fingerprint Service
 * フィンガープリントサービス
 * 指紋計算服務
 */

import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

interface EventData {
  type: string;
  subType?: string;
  message?: string;
  stack?: string;
  resolvedStack?: string;
  method?: string;
  url?: string;
  status?: number;
}

@Injectable()
export class FingerprintService {
  /**
   * 计算事件指纹
   * Compute Event Fingerprint
   * イベントフィンガープリントを計算
   * 計算事件指紋
   *
   * @description_zh 根据事件类型和关键字段计算唯一指纹，用于 Issue 归并
   * @description_en Compute unique fingerprint based on event type and key fields for issue grouping
   * @description_ja イベントタイプとキーフィールドに基づいて一意のフィンガープリントを計算し、Issue のグループ化に使用
   * @description_tw 根據事件類型和關鍵欄位計算唯一指紋，用於 Issue 歸併
   */
  compute({ eventData }: { eventData: EventData }): string {
    const parts: string[] = [];

    if (eventData.type === 'api_error') {
      // API 错误：method + 标准化 URL + status
      parts.push(
        'api_error',
        eventData.method || 'UNKNOWN',
        this.normalizeUrl(eventData.url || ''),
        String(eventData.status || 0),
      );
    } else {
      // 其他错误：subType/type + 标准化 message + top 3 frames
      parts.push(
        eventData.subType || eventData.type,
        this.normalizeMessage(eventData.message || ''),
        this.topFrames(
          eventData.resolvedStack || eventData.stack || '',
          3,
        ),
      );
    }

    return createHash('md5').update(parts.join('||')).digest('hex');
  }

  /**
   * 标准化错误消息
   * Normalize Error Message
   * エラーメッセージを正規化
   * 標準化錯誤訊息
   */
  private normalizeMessage(msg: string): string {
    return msg
      .replace(/\b\d+\b/g, '{N}') // 数字 → {N}
      .replace(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        '{UUID}',
      ) // UUID → {UUID}
      .replace(/\/\d+/g, '/{param}') // 路径参数 → {param}
      .replace(/0x[0-9a-f]+/gi, '{HEX}') // 十六进制 → {HEX}
      .slice(0, 200); // 截断过长消息
  }

  /**
   * 提取堆栈顶部 N 帧
   * Extract Top N Stack Frames
   * スタックのトップ N フレームを抽出
   * 提取堆疊頂部 N 幀
   */
  private topFrames(stack: string, n: number): string {
    if (!stack) return '';

    return stack
      .split('\n')
      .filter((line) => line.includes('at ') || line.includes('@'))
      .slice(0, n)
      .map((line) => line.replace(/:\d+:\d+/g, '')) // 移除行号列号
      .join('|');
  }

  /**
   * 标准化 URL
   * Normalize URL
   * URL を正規化
   * 標準化 URL
   */
  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.pathname
        .replace(/\/\d+/g, '/{id}') // 路径参数 → {id}
        .replace(/\/[0-9a-f-]{36}/gi, '/{uuid}'); // UUID → {uuid}
    } catch {
      return url;
    }
  }
}
