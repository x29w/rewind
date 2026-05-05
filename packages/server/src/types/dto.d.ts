/**
 * Server DTO 类型定义
 * Server DTO Type Definitions
 * Server DTO タイプ定義
 * Server DTO 類型定義
 */

declare namespace DTO {
  /**
   * 事件上报 DTO
   * @description_zh 用于事件上报的数据传输对象
   * @description_en Data Transfer Object for event reporting
   * @description_ja イベントレポート用のデータ転送オブジェクト
   * @description_tw 用於事件上報的資料傳輸物件
   */
  interface ReportEventParams {
    event: {
      type: string;
      message: string;
      timestamp: number;
      stack?: string;
      filename?: string;
      lineno?: number;
      colno?: number;
      extra?: Record<string, any>;
      tags?: Record<string, string>;
      breadcrumbs?: Array<{
        type: string;
        message: string;
        timestamp: number;
        level?: string;
        category?: string;
        data?: Record<string, any>;
      }>;
      deviceInfo?: {
        userAgent: string;
        browser: string;
        browserVersion: string;
        os: string;
        osVersion: string;
        deviceType: string;
        screenWidth: number;
        screenHeight: number;
        viewportWidth: number;
        viewportHeight: number;
        language: string;
        timezone: string;
      };
    };
  }

  /**
   * 批量事件上报 DTO
   * @description_zh 用于批量事件上报的数据传输对象
   * @description_en Data Transfer Object for batch event reporting
   * @description_ja バッチイベントレポート用のデータ転送オブジェクト
   * @description_tw 用於批量事件上報的資料傳輸物件
   */
  interface ReportBatchParams {
    events: ReportEventParams['event'][];
  }
}