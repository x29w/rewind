/**
 * 上报队列
 * Transport Queue
 * 送信キュー
 * 上報佇列
 */

import type { RewindTypes } from '@rewind-dev/shared';

interface QueueItem {
  event: RewindTypes.Event;
  timestamp: number;
  retryCount: number;
}

export class TransportQueue {
  private queue: QueueItem[] = [];
  private maxSize: number;
  private flushInterval: number;
  private flushTimer: number | null = null;
  private isFlushing = false;

  constructor({
    maxSize = 100,
    flushInterval = 5000,
  }: {
    maxSize?: number;
    flushInterval?: number;
  }) {
    this.maxSize = maxSize;
    this.flushInterval = flushInterval;
  }

  /**
   * 添加事件到队列
   * Add Event to Queue
   * イベントをキューに追加
   * 添加事件到佇列
   *
   * @description_zh 将事件加入队列，队列满时自动触发上报
   * @description_en Add event to queue, auto flush when queue is full
   * @description_ja イベントをキューに追加し、キューが満杯になると自動的に送信
   * @description_tw 將事件加入佇列，佇列滿時自動觸發上報
   */
  push(event: RewindTypes.Event): void {
    this.queue.push({
      event,
      timestamp: Date.now(),
      retryCount: 0,
    });

    // 队列满时立即上报
    if (this.queue.length >= this.maxSize) {
      this.flush();
    } else {
      // 否则启动定时器
      this.startFlushTimer();
    }
  }

  /**
   * 获取待上报的事件
   * Get Events to Flush
   * 送信するイベントを取得
   * 取得待上報的事件
   */
  getEvents(): RewindTypes.Event[] {
    return this.queue.map((item) => item.event);
  }

  /**
   * 清空队列
   * Clear Queue
   * キューをクリア
   * 清空佇列
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * 获取队列大小
   * Get Queue Size
   * キューサイズを取得
   * 取得佇列大小
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * 立即上报
   * Flush Immediately
   * 即座に送信
   * 立即上報
   */
  flush(): void {
    if (this.isFlushing || this.queue.length === 0) {
      return;
    }

    this.isFlushing = true;
    this.stopFlushTimer();

    // 触发上报事件（由 Client 监听）
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('rewind:flush', {
        detail: { events: this.getEvents() },
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * 上报成功回调
   * On Flush Success
   * 送信成功コールバック
   * 上報成功回調
   */
  onFlushSuccess(): void {
    this.clear();
    this.isFlushing = false;
  }

  /**
   * 上报失败回调
   * On Flush Failure
   * 送信失敗コールバック
   * 上報失敗回調
   */
  onFlushFailure(): void {
    this.isFlushing = false;

    // 增加重试计数
    this.queue.forEach((item) => {
      item.retryCount++;
    });

    // 移除重试次数过多的事件
    this.queue = this.queue.filter((item) => item.retryCount < 3);

    // 如果还有事件，稍后重试
    if (this.queue.length > 0) {
      this.startFlushTimer();
    }
  }

  /**
   * 启动定时器
   * Start Flush Timer
   * タイマーを開始
   * 啟動定時器
   */
  private startFlushTimer(): void {
    if (this.flushTimer !== null) {
      return;
    }

    this.flushTimer = window.setTimeout(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * 停止定时器
   * Stop Flush Timer
   * タイマーを停止
   * 停止定時器
   */
  private stopFlushTimer(): void {
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * 销毁队列
   * Destroy Queue
   * キューを破棄
   * 銷毀佇列
   */
  destroy(): void {
    this.stopFlushTimer();
    this.clear();
  }
}
