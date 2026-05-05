import { request } from './client';

/**
 * 告警相关 API
 * Alert Related APIs
 * アラート関連API
 * 告警相關 API
 */

/**
 * 测试告警
 * @description_zh 测试指定渠道的告警配置是否正常工作
 * @description_en Test if alert configuration for specified channel works properly
 * @description_ja 指定されたチャネルのアラート設定が正常に動作するかテスト
 * @description_tw 測試指定通道的告警配置是否正常運作
 */
export const testAlertService = async (params: Alert.TestAlertParams): Promise<{ success: boolean }> => {
  return await request<{ success: boolean }>({
    method: 'POST',
    url: '/alerts/test',
    data: params.data,
  });
};

/**
 * 触发告警
 * @description_zh 为指定问题手动触发告警通知
 * @description_en Manually trigger alert notification for specified issue
 * @description_ja 指定された問題に対してアラート通知を手動でトリガー
 * @description_tw 為指定問題手動觸發告警通知
 */
export const triggerAlertService = async (params: Alert.TriggerAlertParams): Promise<{ success: boolean }> => {
  return await request<{ success: boolean }>({
    method: 'POST',
    url: `/alerts/trigger/${params.issueId}`,
  });
};
