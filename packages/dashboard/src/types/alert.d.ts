/**
 * 告警相关类型定义
 * Alert Related Type Definitions
 * アラート関連タイプ定義
 * 告警相關類型定義
 */

declare namespace Alert {
  /**
   * 测试告警参数
   * @description_zh 测试告警配置时需要的参数
   * @description_en Parameters required for testing alert configuration
   * @description_ja アラート設定テストに必要なパラメータ
   * @description_tw 測試告警配置時需要的參數
   */
  interface TestAlertParams {
    data: {
      channel: string;
    };
  }

  /**
   * 触发告警参数
   * @description_zh 手动触发告警时需要的参数
   * @description_en Parameters required for manually triggering alert
   * @description_ja 手動アラートトリガーに必要なパラメータ
   * @description_tw 手動觸發告警時需要的參數
   */
  interface TriggerAlertParams {
    issueId: string;
  }

  /**
   * 告警规则
   * @description_zh 告警规则的配置数据
   * @description_en Alert rule configuration data
   * @description_ja アラートルール設定データ
   * @description_tw 告警規則的配置資料
   */
  interface AlertRule {
    id: string;
    name: string;
    condition: string;
    threshold: number;
    channels: string[];
    enabled: boolean;
  }
}