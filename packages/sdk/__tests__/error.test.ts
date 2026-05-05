/**
 * ErrorPlugin 单元测试
 * ErrorPlugin Unit Tests
 * ErrorPlugin ユニットテスト
 * ErrorPlugin 單元測試
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ErrorPlugin } from '../src/plugins/error';
import { Client } from '../src/core/client';

describe('ErrorPlugin', () => {
  let plugin: ErrorPlugin;
  let client: Client;
  let originalOnError: OnErrorEventHandler;
  let originalAddEventListener: typeof window.addEventListener;

  beforeEach(() => {
    // 保存原始方法
    // Save original methods
    // 元のメソッドを保存
    // 保存原始方法
    originalOnError = window.onerror;
    originalAddEventListener = window.addEventListener;

    // 创建 Client 实例
    // Create Client instance
    // Client インスタンスを作成
    // 創建 Client 實例
    client = Client.init({
      dsn: 'https://test.example.com/api/v1/report',
      appId: 'test-project',
      appVersion: '1.0.0',
    });

    // Mock Client 方法
    // Mock Client methods
    // Client メソッドをモック
    // Mock Client 方法
    vi.spyOn(client, 'addBreadcrumb');
    vi.spyOn(client, 'sendEvent');
    vi.spyOn(client, 'getSessionId').mockReturnValue('test-session-id');
    vi.spyOn(client, 'getUser').mockReturnValue({ id: 'test-user-id' });

    plugin = new ErrorPlugin();
  });

  afterEach(() => {
    plugin.teardown();
    client.destroy();
    window.onerror = originalOnError;
    window.addEventListener = originalAddEventListener;
    vi.restoreAllMocks();
  });

  describe('setup', () => {
    it('should setup plugin correctly', () => {
      plugin.setup(client);
      expect(plugin.name).toBe('ErrorPlugin');
    });

    it('should hijack window.onerror', () => {
      const originalHandler = window.onerror;
      plugin.setup(client);
      expect(window.onerror).not.toBe(originalHandler);
    });

    it('should add unhandledrejection listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      plugin.setup(client);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );
    });

    it('should add resource error listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      plugin.setup(client);
      
      // 应该有 unhandledrejection 和 error 两个监听器
      // Should have both unhandledrejection and error listeners
      // unhandledrejection と error の2つのリスナーがあるべき
      // 應該有 unhandledrejection 和 error 兩個監聽器
      const errorCalls = addEventListenerSpy.mock.calls.filter(
        (call) => call[0] === 'error'
      );
      expect(errorCalls.length).toBeGreaterThan(0);
    });
  });

  describe('teardown', () => {
    it('should restore original onerror', () => {
      plugin.setup(client);
      const hijackedHandler = window.onerror;
      plugin.teardown();
      
      // 应该恢复原始处理器
      // Should restore original handler
      // 元のハンドラーを復元すべき
      // 應該恢復原始處理器
      expect(window.onerror).toBe(originalOnError);
      expect(window.onerror).not.toBe(hijackedHandler);
    });

    it('should remove unhandledrejection listener', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      plugin.setup(client);
      plugin.teardown();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );
    });
  });

  describe('window.onerror', () => {
    beforeEach(() => {
      plugin.setup(client);
    });

    it('should capture window.onerror events', () => {
      const error = new Error('Test error');
      
      // 触发 window.onerror
      // Trigger window.onerror
      // window.onerror をトリガー
      // 觸發 window.onerror
      window.onerror?.('Test error', 'test.js', 10, 5, error);

      expect(client.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'console',
          level: 'error',
          message: 'Test error',
        })
      );

      expect(client.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          sessionId: 'test-session-id',
          userId: 'test-user-id',
          data: expect.objectContaining({
            message: 'Test error',
            filename: 'test.js',
            lineno: 10,
            colno: 5,
          }),
        })
      );
    });

    it('should handle string message', () => {
      window.onerror?.('String error message', 'test.js', 1, 1, undefined);

      expect(client.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            message: 'String error message',
          }),
        })
      );
    });

    it('should handle error without stack', () => {
      const error = new Error('Test error');
      delete error.stack;
      
      window.onerror?.('Test error', 'test.js', 1, 1, error);

      expect(client.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            message: 'Test error',
            stack: undefined,
          }),
        })
      );
    });

    it('should call original onerror if exists', () => {
      const originalHandler = vi.fn();
      window.onerror = originalHandler;
      
      plugin.setup(client);
      
      window.onerror?.('Test', 'test.js', 1, 1, new Error('Test'));
      
      expect(originalHandler).toHaveBeenCalled();
    });
  });

  describe('unhandledrejection', () => {
    beforeEach(() => {
      plugin.setup(client);
    });

    it('should capture unhandled promise rejections with Error', () => {
      const error = new Error('Promise rejection');
      const event = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject(error),
        reason: error,
      });

      window.dispatchEvent(event);

      expect(client.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'console',
          level: 'error',
          message: expect.stringContaining('Promise rejection'),
        })
      );

      expect(client.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          data: expect.objectContaining({
            message: 'Promise rejection',
            type: 'unhandledrejection',
          }),
        })
      );
    });

    it('should handle string rejection reason', () => {
      const event = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject('String reason'),
        reason: 'String reason',
      });

      window.dispatchEvent(event);

      expect(client.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            message: 'String reason',
          }),
        })
      );
    });

    it('should handle object rejection reason', () => {
      const reason = { code: 'ERR_001', message: 'Custom error' };
      const event = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject(reason),
        reason,
      });

      window.dispatchEvent(event);

      expect(client.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            message: JSON.stringify(reason),
          }),
        })
      );
    });
  });

  describe('resource errors', () => {
    beforeEach(() => {
      plugin.setup(client);
    });

    it('should capture script loading errors', () => {
      const script = document.createElement('script');
      script.src = 'https://example.com/script.js';
      document.body.appendChild(script);

      const event = new Event('error');
      Object.defineProperty(event, 'target', { value: script, enumerable: true });
      
      window.dispatchEvent(event);

      expect(client.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'console',
          level: 'error',
          message: expect.stringContaining('SCRIPT'),
        })
      );

      expect(client.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'resource',
            tagName: 'SCRIPT',
            src: 'https://example.com/script.js',
          }),
        })
      );

      document.body.removeChild(script);
    });

    it('should capture link loading errors', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://example.com/style.css';
      document.head.appendChild(link);

      const event = new Event('error');
      Object.defineProperty(event, 'target', { value: link, enumerable: true });
      
      window.dispatchEvent(event);

      expect(client.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'resource',
            tagName: 'LINK',
            src: 'https://example.com/style.css',
          }),
        })
      );

      document.head.removeChild(link);
    });

    it('should capture image loading errors', () => {
      const img = document.createElement('img');
      img.src = 'https://example.com/image.png';
      document.body.appendChild(img);

      const event = new Event('error');
      Object.defineProperty(event, 'target', { value: img, enumerable: true });
      
      window.dispatchEvent(event);

      expect(client.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'resource',
            tagName: 'IMG',
            src: 'https://example.com/image.png',
          }),
        })
      );

      document.body.removeChild(img);
    });

    it('should not capture non-resource errors', () => {
      const div = document.createElement('div');
      const event = new Event('error');
      Object.defineProperty(event, 'target', { value: div, enumerable: true });
      
      const sendEventCallsBefore = (client.sendEvent as any).mock.calls.length;
      window.dispatchEvent(event);
      const sendEventCallsAfter = (client.sendEvent as any).mock.calls.length;

      // 不应该发送事件
      // Should not send event
      // イベントを送信すべきではない
      // 不應該發送事件
      expect(sendEventCallsAfter).toBe(sendEventCallsBefore);
    });
  });

  describe('error handling', () => {
    it('should not throw if client is null', () => {
      plugin.setup(client);
      plugin.teardown(); // 清理 client
      
      expect(() => {
        window.onerror?.('Test', 'test.js', 1, 1, new Error('Test'));
      }).not.toThrow();
    });

    it('should handle errors in error handler gracefully', () => {
      vi.spyOn(client, 'addBreadcrumb').mockImplementation(() => {
        throw new Error('Breadcrumb error');
      });

      plugin.setup(client);

      expect(() => {
        window.onerror?.('Test', 'test.js', 1, 1, new Error('Test'));
      }).not.toThrow();
    });
  });
});
