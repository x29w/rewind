/**
 * 面包屑管理器
 * Breadcrumb Manager
 * ブレッドクラムマネージャー
 * 麵包屑管理器
 * 
 * 使用环形缓冲区存储固定数量的面包屑
 * Uses circular buffer to store fixed number of breadcrumbs
 * 固定数のブレッドクラムを格納するために循環バッファを使用
 * 使用環形緩衝區存儲固定數量的麵包屑
 */

import type { Breadcrumb } from '@rewind-dev/shared';

/**
 * 面包屑管理器类
 * Breadcrumb Manager Class
 * ブレッドクラムマネージャークラス
 * 麵包屑管理器類
 */
export class BreadcrumbManager {
  /**
   * 环形缓冲区
   * Circular buffer
   * 循環バッファ
   * 環形緩衝區
   */
  private buffer: Breadcrumb[];
  
  /**
   * 最大容量
   * Maximum capacity
   * 最大容量
   * 最大容量
   */
  private maxSize: number;
  
  /**
   * 当前写入位置
   * Current write position
   * 現在の書き込み位置
   * 當前寫入位置
   */
  private position: number;
  
  /**
   * 当前大小
   * Current size
   * 現在のサイズ
   * 當前大小
   */
  private size: number;
  
  /**
   * 构造函数
   * Constructor
   * コンストラクタ
   * 建構函式
   * 
   * @param maxSize - 最大容量 / Maximum capacity / 最大容量 / 最大容量
   */
  constructor(maxSize: number = 50) {
    this.buffer = new Array(maxSize);
    this.maxSize = maxSize;
    this.position = 0;
    this.size = 0;
  }
  
  /**
   * 添加面包屑
   * Add breadcrumb
   * ブレッドクラムを追加
   * 添加麵包屑
   * 
   * @param breadcrumb - 面包屑对象 / Breadcrumb object / ブレッドクラムオブジェクト / 麵包屑物件
   */
  push(breadcrumb: Breadcrumb): void {
    this.buffer[this.position] = breadcrumb;
    this.position = (this.position + 1) % this.maxSize;
    
    if (this.size < this.maxSize) {
      this.size++;
    }
  }
  
  /**
   * 获取所有面包屑快照（按时间排序）
   * Get snapshot of all breadcrumbs (sorted by time)
   * すべてのブレッドクラムのスナップショットを取得（時間順）
   * 獲取所有麵包屑快照（按時間排序）
   * 
   * @returns 面包屑数组 / Breadcrumb array / ブレッドクラム配列 / 麵包屑陣列
   */
  snapshot(): Breadcrumb[] {
    if (this.size === 0) {
      return [];
    }
    
    // 如果缓冲区未满，直接返回已有数据
    // If buffer is not full, return existing data directly
    // バッファが満杯でない場合、既存のデータを直接返す
    // 如果緩衝區未滿，直接返回已有數據
    if (this.size < this.maxSize) {
      return this.buffer.slice(0, this.size);
    }
    
    // 缓冲区已满，需要重新排序
    // Buffer is full, need to reorder
    // バッファが満杯の場合、並べ替えが必要
    // 緩衝區已滿，需要重新排序
    const result: Breadcrumb[] = [];
    
    // 从最旧的位置开始读取
    // Start reading from the oldest position
    // 最も古い位置から読み取りを開始
    // 從最舊的位置開始讀取
    for (let i = 0; i < this.maxSize; i++) {
      const index = (this.position + i) % this.maxSize;
      result.push(this.buffer[index]);
    }
    
    return result;
  }
  
  /**
   * 清空所有面包屑
   * Clear all breadcrumbs
   * すべてのブレッドクラムをクリア
   * 清空所有麵包屑
   */
  clear(): void {
    this.buffer = new Array(this.maxSize);
    this.position = 0;
    this.size = 0;
  }
  
  /**
   * 获取当前大小
   * Get current size
   * 現在のサイズを取得
   * 獲取當前大小
   */
  getSize(): number {
    return this.size;
  }
}
