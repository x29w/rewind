/**
 * 性能采集插件
 * Performance Collection Plugin
 * パフォーマンス収集プラグイン
 * 效能採集插件
 */

import type { Plugin } from '../core/plugin-manager';
import type { Client } from '../core/client';
import type { 
  PerformanceData, 
  WebVitals, 
  NavigationTiming, 
  ResourceTiming, 
  LongTask,
  MemoryInfo 
} from '@rewind-dev/shared';
import { safeExecute } from '../utils/safe';

/**
 * 性能插件类
 * Performance Plugin Class
 * パフォーマンスプラグインクラス
 * 效能插件類
 */
export class PerformancePlugin implements Plugin {
  public readonly name = 'PerformancePlugin';
  
  private client: Client | null = null;
  private webVitals: Partial<WebVitals> = {};
  private observers: PerformanceObserver[] = [];
  private longTasks: LongTask[] = [];
  private reported = false;
  
  /**
   * 初始化插件
   * Setup plugin
   * プラグインを初期化
   * 初始化插件
   * 
   * @param client - SDK 客户端实例 / SDK client instance / SDK クライアントインスタンス / SDK 客戶端實例
   */
  public setup(client: Client): void {
    this.client = client;
    
    // 检查浏览器支持
    // Check browser support
    // ブラウザサポートを確認
    // 檢查瀏覽器支援
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      console.warn('[Rewind SDK] PerformanceObserver not supported');
      return;
    }
    
    // 监听 Web Vitals
    // Listen to Web Vitals
    // Web Vitals を監視
    // 監聽 Web Vitals
    this.observeFCP();
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeLongTasks();
    
    // 页面加载完成后收集导航时序
    // Collect navigation timing after page load
    // ページ読み込み完了後にナビゲーションタイミングを収集
    // 頁面載入完成後收集導航時序
    if (document.readyState === 'complete') {
      this.collectNavigationTiming();
    } else {
      window.addEventListener('load', () => {
        this.collectNavigationTiming();
      });
    }
    
    // 页面隐藏时上报
    // Report when page is hidden
    // ページが非表示になったときに報告
    // 頁面隱藏時上報
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.reportPerformance();
      }
    });
    
    // 页面卸载前上报
    // Report before page unload
    // ページアンロード前に報告
    // 頁面卸載前上報
    window.addEventListener('beforeunload', () => {
      this.reportPerformance();
    });
  }
  
  /**
   * 清理插件
   * Teardown plugin
   * プラグインをクリーンアップ
   * 清理插件
   */
  public teardown(): void {
    // 断开所有观察器
    // Disconnect all observers
    // すべてのオブザーバーを切断
    // 斷開所有觀察器
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.client = null;
  }
  
  /**
   * 监听 FCP (First Contentful Paint)
   * Observe FCP (First Contentful Paint)
   * FCP (First Contentful Paint) を監視
   * 監聽 FCP (First Contentful Paint)
   */
  private observeFCP(): void {
    safeExecute(() => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint') {
            this.webVitals.fcp = entry.startTime;
            
            // 添加面包屑
            // Add breadcrumb
            // ブレッドクラムを追加
            // 添加麵包屑
            this.client?.addBreadcrumb({
              type: 'custom',
              level: 'info',
              message: `FCP: ${entry.startTime.toFixed(2)}ms`,
              timestamp: Date.now(),
              data: { fcp: entry.startTime },
            });
          }
        }
      });
      
      observer.observe({ type: 'paint', buffered: true });
      this.observers.push(observer);
    }, 'PerformancePlugin.observeFCP');
  }
  
  /**
   * 监听 LCP (Largest Contentful Paint)
   * Observe LCP (Largest Contentful Paint)
   * LCP (Largest Contentful Paint) を監視
   * 監聽 LCP (Largest Contentful Paint)
   */
  private observeLCP(): void {
    safeExecute(() => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
        
        // LCP 取 renderTime 或 loadTime
        // LCP takes renderTime or loadTime
        // LCP は renderTime または loadTime を取る
        // LCP 取 renderTime 或 loadTime
        this.webVitals.lcp = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime;
        
        // 添加面包屑
        // Add breadcrumb
        // ブレッドクラムを追加
        // 添加麵包屑
        this.client?.addBreadcrumb({
          type: 'custom',
          level: 'info',
          message: `LCP: ${this.webVitals.lcp.toFixed(2)}ms`,
          timestamp: Date.now(),
          data: { lcp: this.webVitals.lcp },
        });
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(observer);
    }, 'PerformancePlugin.observeLCP');
  }
  
  /**
   * 监听 FID (First Input Delay)
   * Observe FID (First Input Delay)
   * FID (First Input Delay) を監視
   * 監聽 FID (First Input Delay)
   */
  private observeFID(): void {
    safeExecute(() => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          const fidEntry = entry as PerformanceEntry & { processingStart?: number };
          this.webVitals.fid = fidEntry.processingStart ? fidEntry.processingStart - entry.startTime : entry.duration;
          
          // 添加面包屑
          // Add breadcrumb
          // ブレッドクラムを追加
          // 添加麵包屑
          this.client?.addBreadcrumb({
            type: 'custom',
            level: 'info',
            message: `FID: ${this.webVitals.fid.toFixed(2)}ms`,
            timestamp: Date.now(),
            data: { fid: this.webVitals.fid },
          });
        }
      });
      
      observer.observe({ type: 'first-input', buffered: true });
      this.observers.push(observer);
    }, 'PerformancePlugin.observeFID');
  }
  
  /**
   * 监听 CLS (Cumulative Layout Shift)
   * Observe CLS (Cumulative Layout Shift)
   * CLS (Cumulative Layout Shift) を監視
   * 監聽 CLS (Cumulative Layout Shift)
   */
  private observeCLS(): void {
    safeExecute(() => {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          
          // 只统计非用户输入导致的布局偏移
          // Only count layout shifts not caused by user input
          // ユーザー入力によらないレイアウトシフトのみをカウント
          // 只統計非用戶輸入導致的佈局偏移
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value || 0;
            this.webVitals.cls = clsValue;
          }
        }
      });
      
      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(observer);
    }, 'PerformancePlugin.observeCLS');
  }
  
  /**
   * 监听长任务
   * Observe long tasks
   * ロングタスクを監視
   * 監聽長任務
   */
  private observeLongTasks(): void {
    safeExecute(() => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          const longTaskEntry = entry as PerformanceEntry & { attribution?: any[] };
          
          const task: LongTask = {
            startTime: entry.startTime,
            duration: entry.duration,
          };
          
          // 提取归因信息
          // Extract attribution info
          // 帰属情報を抽出
          // 提取歸因資訊
          if (longTaskEntry.attribution && longTaskEntry.attribution.length > 0) {
            const attr = longTaskEntry.attribution[0];
            task.attribution = {
              containerType: attr.containerType || '',
              containerName: attr.containerName || '',
              containerId: attr.containerId || '',
            };
          }
          
          this.longTasks.push(task);
          
          // 添加面包屑（只记录超过 100ms 的任务）
          // Add breadcrumb (only for tasks > 100ms)
          // ブレッドクラムを追加（100ms を超えるタスクのみ）
          // 添加麵包屑（只記錄超過 100ms 的任務）
          if (entry.duration > 100) {
            this.client?.addBreadcrumb({
              type: 'custom',
              level: 'warning',
              message: `Long Task: ${entry.duration.toFixed(2)}ms`,
              timestamp: Date.now(),
              data: {
                duration: entry.duration,
                startTime: entry.startTime,
              },
            });
          }
        }
      });
      
      observer.observe({ type: 'longtask', buffered: true });
      this.observers.push(observer);
    }, 'PerformancePlugin.observeLongTasks');
  }
  
  /**
   * 收集导航时序
   * Collect navigation timing
   * ナビゲーションタイミングを収集
   * 收集導航時序
   */
  private collectNavigationTiming(): void {
    safeExecute(() => {
      const timing = performance.timing;
      const navigationStart = timing.navigationStart;
      
      // 计算 TTFB
      // Calculate TTFB
      // TTFB を計算
      // 計算 TTFB
      this.webVitals.ttfb = timing.responseStart - navigationStart;
      
      // 使用 requestIdleCallback 在浏览器空闲时上报
      // Use requestIdleCallback to report when browser is idle
      // ブラウザがアイドル状態のときに requestIdleCallback を使用して報告
      // 使用 requestIdleCallback 在瀏覽器空閒時上報
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          this.reportPerformance();
        }, { timeout: 5000 });
      } else {
        // 降级：使用 load 事件后立即上报
        // Fallback: report immediately after load event
        // フォールバック：load イベント後すぐに報告
        // 降級：使用 load 事件後立即上報
        this.reportPerformance();
      }
    }, 'PerformancePlugin.collectNavigationTiming');
  }
  
  /**
   * 获取导航时序详情
   * Get navigation timing details
   * ナビゲーションタイミング詳細を取得
   * 獲取導航時序詳情
   */
  private getNavigationTiming(): NavigationTiming | undefined {
    return safeExecute(() => {
      const timing = performance.timing;
      const navigationStart = timing.navigationStart;
      
      return {
        dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
        tcpTime: timing.connectEnd - timing.connectStart,
        sslTime: timing.secureConnectionStart > 0 ? timing.connectEnd - timing.secureConnectionStart : 0,
        requestTime: timing.responseStart - timing.requestStart,
        responseTime: timing.responseEnd - timing.responseStart,
        domParseTime: timing.domInteractive - timing.domLoading,
        resourceLoadTime: timing.loadEventStart - timing.domContentLoadedEventEnd,
        domContentLoadedTime: timing.domContentLoadedEventEnd - navigationStart,
        loadTime: timing.loadEventEnd - navigationStart,
      };
    }, 'PerformancePlugin.getNavigationTiming');
  }
  
  /**
   * 获取资源时序
   * Get resource timing
   * リソースタイミングを取得
   * 獲取資源時序
   */
  private getResourceTiming(): ResourceTiming[] {
    return safeExecute(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      return resources.map(resource => {
        // 判断资源类型
        // Determine resource type
        // リソースタイプを判断
        // 判斷資源類型
        let type: ResourceTiming['type'] = 'other';
        if (resource.initiatorType === 'script') type = 'script';
        else if (resource.initiatorType === 'css' || resource.initiatorType === 'link') type = 'css';
        else if (resource.initiatorType === 'img') type = 'img';
        else if (resource.initiatorType === 'xmlhttprequest') type = 'xhr';
        else if (resource.initiatorType === 'fetch') type = 'fetch';
        
        return {
          name: resource.name,
          type,
          startTime: resource.startTime,
          duration: resource.duration,
          transferSize: resource.transferSize,
          encodedSize: resource.encodedBodySize,
          decodedSize: resource.decodedBodySize,
        };
      });
    }, 'PerformancePlugin.getResourceTiming') || [];
  }
  
  /**
   * 获取内存信息
   * Get memory info
   * メモリ情報を取得
   * 獲取記憶體資訊
   */
  private getMemoryInfo(): MemoryInfo | undefined {
    return safeExecute(() => {
      const memory = (performance as any).memory;
      if (!memory) return undefined;
      
      return {
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        totalJSHeapSize: memory.totalJSHeapSize,
        usedJSHeapSize: memory.usedJSHeapSize,
      };
    }, 'PerformancePlugin.getMemoryInfo');
  }
  
  /**
   * 上报性能数据
   * Report performance data
   * パフォーマンスデータを報告
   * 上報效能資料
   */
  private reportPerformance(): void {
    if (this.reported || !this.client) {
      return;
    }
    
    safeExecute(() => {
      const performanceData: PerformanceData = {
        webVitals: this.webVitals,
        navigationTiming: this.getNavigationTiming(),
        resourceTiming: this.getResourceTiming(),
        longTasks: this.longTasks.length > 0 ? this.longTasks : undefined,
        memoryInfo: this.getMemoryInfo(),
        pageUrl: window.location.href,
        timestamp: Date.now(),
      };
      
      // 发送性能事件
      // Send performance event
      // パフォーマンスイベントを送信
      // 發送效能事件
      this.client!.sendEvent({
        type: 'performance',
        timestamp: Date.now(),
        sessionId: this.client!.getSessionId(),
        userId: this.client!.getUser()?.id,
        data: performanceData,
      });
      
      this.reported = true;
      
      if (this.client!.config.debug) {
        console.log('[Rewind SDK] Performance data reported:', performanceData);
      }
    }, 'PerformancePlugin.reportPerformance');
  }
}
