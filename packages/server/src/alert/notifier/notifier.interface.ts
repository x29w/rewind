/**
 * 通知器接口
 * Notifier Interface
 * 通知インターフェース
 * 通知器介面
 */

export interface INotifier {
  /**
   * 发送通知
   * Send Notification
   * 通知を送信
   * 發送通知
   */
  send(params: {
    title: string;
    message: string;
    url?: string;
    to?: string[];
  }): Promise<void>;
}
