/**
 * 错误捕获插件
 * Error Capture Plugin
 * エラーキャプチャプラグイン
 * 錯誤捕獲插件
 */

import type { Plugin } from '../core/plugin-manager';
import type { Client } from '../core/client';
import { safeExecute } from '../utils/safe';

/**
 * 错误插件类
 * Error Plugin Class
 * エラープラグインクラス
 * 錯誤插件類
 */
export class ErrorPlugin implements Plugin {
  public readonly name = 'ErrorPlugin';
  
  private client: Client | null = null;
  private originalOnError: OnErrorEventHandler | null = null;
  private originalOnUnhandledRejection: ((event: PromiseRejectionEvent) => void) | null = null;
  
  /**
   * 初始化插件
   * Setup plugin
   * プラグインを初期化
   * 初始化插件
   */
  public setup(client: Client): void {
    this.client = client;
    
    // 劫持 window.onerror
    // Hijack window.onerror
    // window.onerror を乗っ取る
    // 劫持 window.onerror
    this.setupWindowError();
    
    // 监听 unhandledrejection
    // Listen to unhandledrejection
    // unhandledrejection を監視
    // 監聽 unhandledrejection
    this.setupUnhandledRejection();
    
    // 监听资源加载错误
    // Listen to resource loading errors
    // リソース読み込みエラーを監視
    // 監聽資源加載錯誤
    this.setupResourceError();
  }
  
  /**
   * 清理插件
   * Teardown plugin
   * プラグインをクリーンアップ
   * 清理插件
   */
  public teardown(): void {
    // 恢复原始 onerror
    // Restore original onerror
    // 元の onerror を復元
    // 恢復原始 onerror
    window.onerror = this.originalOnError;
    
    // 移除 unhandledrejection 监听
    // Remove unhandledrejection listener
    // unhandledrejection リスナーを削除
    // 移除 unhandledrejection 監聽
    if (this.originalOnUnhandledRejection) {
      window.removeEventListener('unhandledrejection', this.originalOnUnhandledRejection);
    }
    
    this.client = null;
  }
  
  /**
   * 设置 window.onerror 劫持
   * Setup window.onerror hijacking
   * window.onerror の乗っ取りを設定
   * 設置 window.onerror 劫持
   */
  private setupWindowError(): void {
    this.originalOnError = window.onerror;
    
    window.onerror = (message, source, lineno, colno, error) => {
      safeExecute(() => {
        if (!this.client) return;
        
        // 构建错误事件
        // Build error event
        // エラーイベントを構築
        // 構建錯誤事件
        const errorData = {
          message: typeof message === 'string' ? message : String(message),
          filename: source,
          lineno,
          colno,
          stack: error?.stack,
          name: error?.name || 'Error',
        };
        
        // 添加面包屑
        // Add breadcrumb
        // ブレッドクラムを追加
        // 添加麵包屑
        this.client.addBreadcrumb({
          type: 'console',
          level: 'error',
          message: errorData.message,
          timestamp: Date.now(),
          data: {
            filename: errorData.filename,
            lineno: errorData.lineno,
            colno: errorData.colno,
          },
        });
        
        // 发送错误事件
        // Send error event
        // エラーイベントを送信
        // 發送錯誤事件
        this.client.sendEvent({
          type: 'error',
          timestamp: Date.now(),
          sessionId: this.client.getSessionId(),
          userId: this.client.getUser()?.id,
          data: errorData,
        });
      }, 'ErrorPlugin.windowError');
      
      // 调用原始 onerror
      // Call original onerror
      // 元の onerror を呼び出す
      // 調用原始 onerror
      if (this.originalOnError) {
        return this.originalOnError(message, source, lineno, colno, error);
      }
      
      return false;
    };
  }
  
  /**
   * 设置 unhandledrejection 监听
   * Setup unhandledrejection listener
   * unhandledrejection リスナーを設定
   * 設置 unhandledrejection 監聽
   */
  private setupUnhandledRejection(): void {
    const handler = (event: PromiseRejectionEvent) => {
      safeExecute(() => {
        if (!this.client) return;
        
        const reason = event.reason;
        let message = 'Unhandled Promise Rejection';
        let stack: string | undefined;
        let name = 'UnhandledRejection';
        
        if (reason instanceof Error) {
          message = reason.message;
          stack = reason.stack;
          name = reason.name;
        } else if (typeof reason === 'string') {
          message = reason;
        } else {
          message = JSON.stringify(reason);
        }
        
        // 添加面包屑
        // Add breadcrumb
        // ブレッドクラムを追加
        // 添加麵包屑
        this.client.addBreadcrumb({
          type: 'console',
          level: 'error',
          message: `Promise Rejection: ${message}`,
          timestamp: Date.now(),
        });
        
        // 发送错误事件
        // Send error event
        // エラーイベントを送信
        // 發送錯誤事件
        this.client.sendEvent({
          type: 'error',
          timestamp: Date.now(),
          sessionId: this.client.getSessionId(),
          userId: this.client.getUser()?.id,
          data: {
            message,
            stack,
            name,
            type: 'unhandledrejection',
          },
        });
      }, 'ErrorPlugin.unhandledRejection');
    };
    
    this.originalOnUnhandledRejection = handler;
    window.addEventListener('unhandledrejection', handler);
  }
  
  /**
   * 设置资源加载错误监听
   * Setup resource loading error listener
   * リソース読み込みエラーリスナーを設定
   * 設置資源加載錯誤監聽
   */
  private setupResourceError(): void {
    window.addEventListener(
      'error',
      (event) => {
        safeExecute(() => {
          if (!this.client) return;
          
          const target = event.target as HTMLElement;
          
          // 只处理资源加载错误
          // Only handle resource loading errors
          // リソース読み込みエラーのみを処理
          // 只處理資源加載錯誤
          if (
            target &&
            (target.tagName === 'SCRIPT' ||
              target.tagName === 'LINK' ||
              target.tagName === 'IMG')
          ) {
            const src =
              (target as HTMLScriptElement).src ||
              (target as HTMLLinkElement).href ||
              (target as HTMLImageElement).src;
            
            // 添加面包屑
            // Add breadcrumb
            // ブレッドクラムを追加
            // 添加麵包屑
            this.client.addBreadcrumb({
              type: 'console',
              level: 'error',
              message: `Resource loading failed: ${target.tagName}`,
              timestamp: Date.now(),
              data: {
                tagName: target.tagName,
                src,
              },
            });
            
            // 发送错误事件
            // Send error event
            // エラーイベントを送信
            // 發送錯誤事件
            this.client.sendEvent({
              type: 'error',
              timestamp: Date.now(),
              sessionId: this.client.getSessionId(),
              userId: this.client.getUser()?.id,
              data: {
                message: `Failed to load ${target.tagName.toLowerCase()}: ${src}`,
                name: 'ResourceError',
                type: 'resource',
                tagName: target.tagName,
                src,
              },
            });
          }
        }, 'ErrorPlugin.resourceError');
      },
      true // 使用捕获阶段 / Use capture phase / キャプチャフェーズを使用 / 使用捕獲階段
    );
  }
}
