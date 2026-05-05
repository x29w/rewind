/**
 * 离线存储
 * Offline Storage
 * オフラインストレージ
 * 離線儲存
 */

import type { RewindTypes } from '@rewind-dev/shared';

const DB_NAME = 'rewind-offline';
const STORE_NAME = 'events';
const DB_VERSION = 1;
const MAX_EVENTS = 1000;

export class OfflineStorage {
  private db: IDBDatabase | null = null;
  private isSupported = false;

  constructor() {
    this.isSupported = this.checkSupport();
  }

  /**
   * 初始化数据库
   * Initialize Database
   * データベースを初期化
   * 初始化資料庫
   *
   * @description_zh 打开 IndexedDB 数据库
   * @description_en Open IndexedDB database
   * @description_ja IndexedDB データベースを開く
   * @description_tw 開啟 IndexedDB 資料庫
   */
  async init(): Promise<void> {
    if (!this.isSupported) {
      console.warn('IndexedDB not supported');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * 保存事件
   * Save Event
   * イベントを保存
   * 儲存事件
   *
   * @description_zh 将事件保存到 IndexedDB
   * @description_en Save event to IndexedDB
   * @description_ja イベントを IndexedDB に保存
   * @description_tw 將事件儲存到 IndexedDB
   */
  async save(event: RewindTypes.Event): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // 检查存储数量限制
    const count = await this.count();
    if (count >= MAX_EVENTS) {
      // 删除最旧的事件
      await this.removeOldest();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.add({
        event,
        timestamp: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取所有事件
   * Get All Events
   * すべてのイベントを取得
   * 取得所有事件
   */
  async getAll(): Promise<Array<{ id: number; event: RewindTypes.Event }>> {
    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result.map((item: any) => ({
          id: item.id,
          event: item.event,
        }));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 删除事件
   * Remove Event
   * イベントを削除
   * 刪除事件
   */
  async remove(id: number): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 批量删除事件
   * Remove Multiple Events
   * 複数のイベントを削除
   * 批次刪除事件
   */
  async removeMany(ids: number[]): Promise<void> {
    if (!this.db || ids.length === 0) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      let completed = 0;
      let hasError = false;

      ids.forEach((id) => {
        const request = store.delete(id);

        request.onsuccess = () => {
          completed++;
          if (completed === ids.length && !hasError) {
            resolve();
          }
        };

        request.onerror = () => {
          hasError = true;
          reject(request.error);
        };
      });
    });
  }

  /**
   * 清空所有事件
   * Clear All Events
   * すべてのイベントをクリア
   * 清空所有事件
   */
  async clear(): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取事件数量
   * Get Event Count
   * イベント数を取得
   * 取得事件數量
   */
  async count(): Promise<number> {
    if (!this.db) {
      return 0;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 删除最旧的事件
   * Remove Oldest Event
   * 最も古いイベントを削除
   * 刪除最舊的事件
   */
  private async removeOldest(): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor();

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          resolve();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 检查是否支持 IndexedDB
   * Check IndexedDB Support
   * IndexedDB サポートを確認
   * 檢查是否支援 IndexedDB
   */
  private checkSupport(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  /**
   * 关闭数据库
   * Close Database
   * データベースを閉じる
   * 關閉資料庫
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
