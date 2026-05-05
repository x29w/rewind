/**
 * Server 摄取服务类型定义
 * Server Ingestion Service Type Definitions
 * Server インジェストサービスタイプ定義
 * Server 攝取服務類型定義
 */

declare namespace Ingestion {
  /**
   * 处理事件参数
   * @description_zh 处理单个事件时需要的参数
   * @description_en Parameters required for processing single event
   * @description_ja 単一イベント処理に必要なパラメータ
   * @description_tw 處理單個事件時需要的參數
   */
  interface ProcessEventParams {
    event: DTO.ReportEventParams['event'];
    apiKey: string;
  }

  /**
   * 批量处理事件参数
   * @description_zh 批量处理事件时需要的参数
   * @description_en Parameters required for processing batch events
   * @description_ja バッチイベント処理に必要なパラメータ
   * @description_tw 批量處理事件時需要的參數
   */
  interface ProcessBatchParams {
    events: DTO.ReportEventParams['event'][];
    apiKey: string;
  }

  /**
   * 生成指纹参数
   * @description_zh 生成事件指纹时需要的参数
   * @description_en Parameters required for generating event fingerprint
   * @description_ja イベントフィンガープリント生成に必要なパラメータ
   * @description_tw 生成事件指紋時需要的參數
   */
  interface GenerateFingerprintParams {
    event: DTO.ReportEventParams['event'];
  }

  /**
   * 查找或创建问题参数
   * @description_zh 查找或创建问题时需要的参数
   * @description_en Parameters required for finding or creating issues
   * @description_ja 問題検索または作成に必要なパラメータ
   * @description_tw 查找或建立問題時需要的參數
   */
  interface FindOrCreateIssueParams {
    appId: string;
    event: DTO.ReportEventParams['event'];
    fingerprint: string;
  }
}