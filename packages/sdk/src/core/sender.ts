/**
 * 数据发送器
 * Data Sender
 * データ送信
 * 資料發送器
 */

import type { RewindTypes } from '@rewind-dev/shared';

interface SendOptions {
  url: string;
  apiKey: string;
  data: any;
  timeout?: number;
}

export class Sender {
  /**
   * 发送数据（自动降级）
   * Send Data (Auto Fallback)
   * データを送信（自動フォールバック）
   * 發送資料（自動降級）
   *
   * @description_zh 按优先级尝试：Beacon → Fetch → XHR → Image
   * @description_en Try in order: Beacon → Fetch → XHR → Image
   * @description_ja 優先順位で試行：Beacon → Fetch → XHR → Image
   * @description_tw 按優先順序嘗試：Beacon → Fetch → XHR → Image
   */
  async send(options: SendOptions): Promise<boolean> {
    // 1. 尝试 Beacon（最可靠，页面卸载时也能发送）
    if (this.canUseBeacon()) {
      const success = this.sendBeacon(options);
      if (success) return true;
    }

    // 2. 尝试 Fetch
    if (this.canUseFetch()) {
      try {
        await this.sendFetch(options);
        return true;
      } catch (error) {
        console.warn('Fetch failed, fallback to XHR:', error);
      }
    }

    // 3. 尝试 XHR
    try {
      await this.sendXHR(options);
      return true;
    } catch (error) {
      console.warn('XHR failed, fallback to Image:', error);
    }

    // 4. 最后尝试 Image（最兼容但功能有限）
    try {
      await this.sendImage(options);
      return true;
    } catch (error) {
      console.error('All send methods failed:', error);
      return false;
    }
  }

  /**
   * 使用 Beacon 发送
   * Send via Beacon
   * Beacon で送信
   * 使用 Beacon 發送
   */
  private sendBeacon(options: SendOptions): boolean {
    const { url, apiKey, data } = options;

    const blob = new Blob([JSON.stringify(data)], {
      type: 'application/json',
    });

    // Beacon 不支持自定义 header，需要在 URL 中传递 API Key
    const urlWithKey = `${url}?apiKey=${encodeURIComponent(apiKey)}`;

    return navigator.sendBeacon(urlWithKey, blob);
  }

  /**
   * 使用 Fetch 发送
   * Send via Fetch
   * Fetch で送信
   * 使用 Fetch 發送
   */
  private async sendFetch(options: SendOptions): Promise<void> {
    const { url, apiKey, data, timeout = 10000 } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
        keepalive: true, // 页面卸载时也能发送
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 使用 XHR 发送
   * Send via XHR
   * XHR で送信
   * 使用 XHR 發送
   */
  private sendXHR(options: SendOptions): Promise<void> {
    const { url, apiKey, data, timeout = 10000 } = options;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.timeout = timeout;
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.ontimeout = () => reject(new Error('Request timeout'));

      xhr.send(JSON.stringify(data));
    });
  }

  /**
   * 使用 Image 发送（GET 请求）
   * Send via Image (GET request)
   * Image で送信（GET リクエスト）
   * 使用 Image 發送（GET 請求）
   */
  private sendImage(options: SendOptions): Promise<void> {
    const { url, apiKey, data } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const params = new URLSearchParams({
        apiKey,
        data: JSON.stringify(data),
      });

      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image request failed'));

      img.src = `${url}?${params.toString()}`;

      // 5 秒超时
      setTimeout(() => reject(new Error('Image request timeout')), 5000);
    });
  }

  /**
   * 检查是否支持 Beacon
   * Check Beacon Support
   * Beacon サポートを確認
   * 檢查是否支援 Beacon
   */
  private canUseBeacon(): boolean {
    return typeof navigator !== 'undefined' && 'sendBeacon' in navigator;
  }

  /**
   * 检查是否支持 Fetch
   * Check Fetch Support
   * Fetch サポートを確認
   * 檢查是否支援 Fetch
   */
  private canUseFetch(): boolean {
    return typeof fetch !== 'undefined';
  }
}
