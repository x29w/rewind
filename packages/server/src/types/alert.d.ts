/**
 * Server 告警服务类型定义
 * Server Alert Service Type Definitions
 * Server アラートサービスタイプ定義
 * Server 告警服務類型定義
 */

declare namespace Alert {
  /**
   * 测试告警参数
   * @description_zh 测试告警时需要的参数
   * @description_en Parameters required for testing alerts
   * @description_ja アラートテストに必要なパラメータ
   * @description_tw 測試告警時需要的參數
   */
  interface TestAlertParams {
    data: {
      channel: string;
    };
  }

  /**
   * 触发告警参数
   * @description_zh 触发告警时需要的参数
   * @description_en Parameters required for triggering alerts
   * @description_ja アラート発火に必要なパラメータ
   * @description_tw 觸發告警時需要的參數
   */
  interface TriggerAlertParams {
    issueId: string;
  }

  /**
   * 检查告警参数
   * @description_zh 检查告警时需要的参数
   * @description_en Parameters required for checking alerts
   * @description_ja アラートチェックに必要なパラメータ
   * @description_tw 檢查告警時需要的參數
   */
  interface CheckAlertsParams {
    issue: any;
  }

  /**
   * 发送告警参数
   * @description_zh 发送告警时需要的参数
   * @description_en Parameters required for sending alerts
   * @description_ja アラート送信に必要なパラメータ
   * @description_tw 發送告警時需要的參數
   */
  interface SendAlertParams {
    event: AlertEvent;
  }

  /**
   * 告警事件
   * @description_zh 告警事件的数据结构
   * @description_en Alert event data structure
   * @description_ja アラートイベントのデータ構造
   * @description_tw 告警事件的資料結構
   */
  interface AlertEvent {
    type: 'issue_created' | 'issue_spike' | 'issue_regression';
    issue: any;
    project: any;
    timestamp: number;
    metadata?: Record<string, any>;
  }
}