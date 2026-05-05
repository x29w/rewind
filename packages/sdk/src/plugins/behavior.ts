/**
 * 行为录制插件
 * Behavior Recording Plugin
 * 動作記録プラグイン
 * 行為錄製插件
 */

import type { Plugin } from '../core/plugin-manager';
import type { Client } from '../core/client';
import { safeExecute, throttle } from '../utils/safe';
import { getElementPath, getElementText, getElementSelector } from '../utils/dom';

/**
 * 行为插件类
 * Behavior Plugin Class
 * 動作プラグインクラス
 * 行為插件類
 */
export class BehaviorPlugin implements Plugin {
  public readonly name = 'BehaviorPlugin';
  
  private client: Client | null = null;
  private lastUrl: string = '';
  private lastVisibilityState: DocumentVisibilityState = 'visible';
  private visibilityChangeTime: number = Date.now();
  
  /**
   * 初始化插件
   * Setup plugin
   * プラグインを初期化
   * 初始化插件
   */
  public setup(client: Client): void {
    this.client = client;
    this.lastUrl = window.location.href;
    this.lastVisibilityState = document.visibilityState;
    
    // 监听点击事件
    // Listen to click events
    // クリックイベントを監視
    // 監聽點擊事件
    this.setupClickListener();
    
    // 监听路由变化
    // Listen to route changes
    // ルート変更を監視
    // 監聽路由變化
    this.setupRouteListener();
    
    // 监听输入事件
    // Listen to input events
    // 入力イベントを監視
    // 監聽輸入事件
    this.setupInputListener();
    
    // 监听可见性变化
    // Listen to visibility changes
    // 可視性変更を監視
    // 監聽可見性變化
    this.setupVisibilityListener();
  }
  
  /**
   * 清理插件
   * Teardown plugin
   * プラグインをクリーンアップ
   * 清理插件
   */
  public teardown(): void {
    this.client = null;
  }
  
  /**
   * 设置点击事件监听
   * Setup click event listener
   * クリックイベントリスナーを設定
   * 設置點擊事件監聽
   */
  private setupClickListener(): void {
    document.addEventListener('click', (event) => {
      safeExecute(() => {
        if (!this.client) return;
        
        const target = event.target as HTMLElement;
        if (!target) return;
        
        const path = getElementPath(target);
        const text = getElementText(target);
        const selector = getElementSelector(target);
        
        this.client.addBreadcrumb({
          type: 'click',
          level: 'info',
          message: `Clicked ${path}${text ? `: ${text}` : ''}`,
          timestamp: Date.now(),
          data: {
            selector,
            text,
            tagName: target.tagName.toLowerCase(),
          },
        });
      }, 'BehaviorPlugin.click');
    }, true);
  }
  
  /**
   * 设置路由变化监听
   * Setup route change listener
   * ルート変更リスナーを設定
   * 設置路由變化監聽
   */
  private setupRouteListener(): void {
    // 劫持 pushState
    // Hijack pushState
    // pushState を乗っ取る
    // 劫持 pushState
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handleRouteChange();
    };
    
    // 劫持 replaceState
    // Hijack replaceState
    // replaceState を乗っ取る
    // 劫持 replaceState
    const originalReplaceState = history.replaceState;
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.handleRouteChange();
    };
    
    // 监听 popstate
    // Listen to popstate
    // popstate を監視
    // 監聽 popstate
    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });
    
    // 监听 hashchange
    // Listen to hashchange
    // hashchange を監視
    // 監聽 hashchange
    window.addEventListener('hashchange', () => {
      this.handleRouteChange();
    });
  }
  
  /**
   * 处理路由变化
   * Handle route change
   * ルート変更を処理
   * 處理路由變化
   */
  private handleRouteChange(): void {
    safeExecute(() => {
      if (!this.client) return;
      
      const newUrl = window.location.href;
      
      if (newUrl !== this.lastUrl) {
        this.client.addBreadcrumb({
          type: 'navigation',
          level: 'info',
          message: `Navigation: ${this.lastUrl} → ${newUrl}`,
          timestamp: Date.now(),
          data: {
            from: this.lastUrl,
            to: newUrl,
          },
        });
        
        this.lastUrl = newUrl;
      }
    }, 'BehaviorPlugin.routeChange');
  }
  
  /**
   * 设置输入事件监听（节流）
   * Setup input event listener (throttled)
   * 入力イベントリスナーを設定（スロットル）
   * 設置輸入事件監聽（節流）
   */
  private setupInputListener(): void {
    const throttledHandler = throttle((event: Event) => {
      safeExecute(() => {
        if (!this.client) return;
        
        const target = event.target as HTMLInputElement | HTMLTextAreaElement;
        if (!target) return;
        
        // 只记录输入长度，不记录内容（隐私保护）
        // Only record input length, not content (privacy protection)
        // 入力長のみを記録し、内容は記録しない（プライバシー保護）
        // 只記錄輸入長度，不記錄內容（隱私保護）
        const length = target.value?.length || 0;
        const path = getElementPath(target);
        
        this.client.addBreadcrumb({
          type: 'custom',
          level: 'info',
          message: `Input in ${path}: ${length} characters`,
          timestamp: Date.now(),
          category: 'input',
          data: {
            selector: getElementSelector(target),
            tagName: target.tagName.toLowerCase(),
            type: target.type,
            length,
          },
        });
      }, 'BehaviorPlugin.input');
    }, 500); // 500ms 节流 / 500ms throttle / 500ms スロットル / 500ms 節流
    
    document.addEventListener('input', throttledHandler, true);
  }
  
  /**
   * 设置可见性变化监听
   * Setup visibility change listener
   * 可視性変更リスナーを設定
   * 設置可見性變化監聽
   */
  private setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      safeExecute(() => {
        if (!this.client) return;
        
        const currentState = document.visibilityState;
        const now = Date.now();
        const duration = now - this.visibilityChangeTime;
        
        let message = '';
        if (currentState === 'hidden') {
          message = 'Page hidden';
        } else if (currentState === 'visible') {
          message = `Page visible (was hidden for ${Math.round(duration / 1000)}s)`;
        }
        
        this.client.addBreadcrumb({
          type: 'custom',
          level: 'info',
          message,
          timestamp: now,
          category: 'visibility',
          data: {
            state: currentState,
            previousState: this.lastVisibilityState,
            duration,
          },
        });
        
        this.lastVisibilityState = currentState;
        this.visibilityChangeTime = now;
      }, 'BehaviorPlugin.visibility');
    });
  }
}
