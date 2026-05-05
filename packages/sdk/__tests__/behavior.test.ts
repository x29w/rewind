/**
 * BehaviorPlugin 单元测试
 * BehaviorPlugin Unit Tests
 * BehaviorPlugin ユニットテスト
 * BehaviorPlugin 單元測試
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BehaviorPlugin } from '../src/plugins/behavior';
import { Client } from '../src/core/client';

describe('BehaviorPlugin', () => {
  let plugin: BehaviorPlugin;
  let client: Client;
  let originalPushState: typeof history.pushState;
  let originalReplaceState: typeof history.replaceState;

  beforeEach(() => {
    // 保存原始方法
    // Save original methods
    // 元のメソッドを保存
    // 保存原始方法
    originalPushState = history.pushState;
    originalReplaceState = history.replaceState;

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

    plugin = new BehaviorPlugin();
  });

  afterEach(() => {
    plugin.teardown();
    client.destroy();
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    vi.restoreAllMocks();
  });

  describe('setup', () => {
    it('should setup plugin correctly', () => {
      plugin.setup(client);
      expect(plugin.name).toBe('BehaviorPlugin');
    });

    it('should hijack history.pushState', () => {
      const originalMethod = history.pushState;
      plugin.setup(client);
      expect(history.pushState).not.toBe(originalMethod);
    });

    it('should hijack history.replaceState', () => {
      const originalMethod = history.replaceState;
      plugin.setup(client);
      expect(history.replaceState).not.toBe(originalMethod);
    });

    it('should add click event listener', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      plugin.setup(client);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
        true
      );
    });

    it('should add input event listener', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      plugin.setup(client);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'input',
        expect.any(Function),
        true
      );
    });

    it('should add visibilitychange event listener', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      plugin.setup(client);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      );
    });
  });

  describe('teardown', () => {
    it('should clear client reference', () => {
      plugin.setup(client);
      plugin.teardown();
      
      // 点击事件不应该添加面包屑
      // Click events should not add breadcrumbs
      // クリックイベントはブレッドクラムを追加すべきではない
      // 點擊事件不應該添加麵包屑
      const button = document.createElement('button');
      document.body.appendChild(button);
      button.click();
      
      expect(client.addBreadcrumb).not.toHaveBeenCalled();
      
      document.body.removeChild(button);
    });
  });

  describe('click tracking', () => {
    beforeEach(() => {
      plugin.setup(client);
    });

    it('should track button clicks', () => {
      const button = document.createElement('button');
      button.textContent = 'Click me';
      button.id = 'test-button';
      document.body.appendChild(button);

      button.click();

      expect(client.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
          level: 'info',
          message: expect.stringContaining('Click me'),
          data: expect.objectContaining({
            tagName: 'button',
            text: 'Click me',
          }),
        })
      );

      document.body.removeChild(button);
    });

    it('should track link clicks', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      link.textContent = 'Link text';
      document.body.appendChild(link);

      link.click();

      expect(client.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
          level: 'info',
          data: expect.objectContaining({
            tagName: 'a',
            text: 'Link text',
          }),
        })
      );

      document.body.removeChild(link);
    });

    it('should track clicks on elements without text', () => {
      const div = document.createElement('div');
      div.id = 'test-div';
      document.body.appendChild(div);

      div.click();

      expect(client.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
          level: 'info',
          data: expect.objectContaining({
            tagName: 'div',
          }),
        })
      );

      document.body.removeChild(div);
    });
  });

  describe('route tracking', () => {
    beforeEach(() => {
      plugin.setup(client);
      vi.clearAllMocks(); // 清除 setup 时的调用
    });

    it('should track pushState navigation', () => {
      const initialUrl = window.location.href;
      
      history.pushState({}, '', '/new-page');

      expect(client.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'navigation',
          level: 'info',
          message: expect.stringContaining('/new-page'),
          data: expect.objectContaining({
            from: initialUrl,
            to: expect.stringContaining('/new-page'),
          }),
        })
      );

      // 恢复原始 URL
      // Restore original URL
      // 元の URL を復元
      // 恢復原始 URL
      history.pushState({}, '', initialUrl);
    });

    it('should track replaceState navigation', () => {
      const initialUrl = window.location.href;
      
      history.replaceState({}, '', '/replaced-page');

      expect(client.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'navigation',
          level: 'info',
          data: expect.objectContaining({
            from: initialUrl,
            to: expect.stringContaining('/replaced-page'),
          }),
        })
      );

      history.replaceState({}, '', initialUrl);
    });

    it('should track popstate events', () => {
      const initialUrl = window.location.href;
      
      // 先改变 URL
      // First change URL
      // まず URL を変更
      // 先改變 URL
      history.pushState({}, '', '/page1');
      vi.clearAllMocks();
      
      // 触发 popstate
      // Trigger popstate
      // popstate をトリガー
      // 觸發 popstate
      history.pushState({}, '', '/page2');
      window.dispatchEvent(new PopStateEvent('popstate'));

      expect(client.addBreadcrumb).toHaveBeenCalled();

      history.pushState({}, '', initialUrl);
    });

    it('should track hashchange events', () => {
      const initialUrl = window.location.href;
      
      window.location.hash = '#section1';
      window.dispatchEvent(new HashChangeEvent('hashchange'));

      expect(client.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'navigation',
          level: 'info',
        })
      );

      window.location.hash = '';
    });

    it('should not track if URL does not change', () => {
      const currentUrl = window.location.href;
      
      vi.clearAllMocks();
      history.pushState({}, '', currentUrl);

      // 不应该添加面包屑
      // Should not add breadcrumb
      // ブレッドクラムを追加すべきではない
      // 不應該添加麵包屑
      expect(client.addBreadcrumb).not.toHaveBeenCalled();
    });
  });

  describe('input tracking', () => {
    beforeEach(() => {
      plugin.setup(client);
      vi.clearAllMocks();
    });

    it('should track input events (throttled)', async () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'test-input';
      document.body.appendChild(input);

      input.value = 'test';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // 等待节流
      // Wait for throttle
      // スロットルを待つ
      // 等待節流
      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(client.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'custom',
          level: 'info',
          category: 'input',
          message: expect.stringContaining('4 characters'),
          data: expect.objectContaining({
            tagName: 'input',
            type: 'text',
            length: 4,
          }),
        })
      );

      document.body.removeChild(input);
    });

    it('should track textarea events', async () => {
      const textarea = document.createElement('textarea');
      textarea.id = 'test-textarea';
      document.body.appendChild(textarea);

      textarea.value = 'Hello World';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));

      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(client.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'input',
          data: expect.objectContaining({
            tagName: 'textarea',
            length: 11,
          }),
        })
      );

      document.body.removeChild(textarea);
    });

    it('should throttle rapid input events', async () => {
      const input = document.createElement('input');
      document.body.appendChild(input);

      // 快速触发多次
      // Trigger multiple times rapidly
      // 複数回素早くトリガー
      // 快速觸發多次
      input.value = 'a';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.value = 'ab';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.value = 'abc';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      await new Promise((resolve) => setTimeout(resolve, 600));

      // 应该只调用一次或两次（节流）
      // Should only be called once or twice (throttled)
      // 一度または二度だけ呼び出されるべき（スロットル）
      // 應該只調用一次或兩次（節流）
      expect(client.addBreadcrumb).toHaveBeenCalledTimes(2);

      document.body.removeChild(input);
    });
  });

  describe('visibility tracking', () => {
    beforeEach(() => {
      plugin.setup(client);
      vi.clearAllMocks();
    });

    it('should track visibility changes', () => {
      // Mock visibilityState
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'hidden',
      });

      document.dispatchEvent(new Event('visibilitychange'));

      expect(client.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'custom',
          level: 'info',
          category: 'visibility',
          message: 'Page hidden',
          data: expect.objectContaining({
            state: 'hidden',
          }),
        })
      );

      // 恢复
      // Restore
      // 復元
      // 恢復
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'visible',
      });
    });

    it('should track page becoming visible with duration', async () => {
      // 先设置为 hidden
      // First set to hidden
      // まず hidden に設定
      // 先設置為 hidden
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
      vi.clearAllMocks();

      // 等待一段时间
      // Wait for some time
      // しばらく待つ
      // 等待一段時間
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 设置为 visible
      // Set to visible
      // visible に設定
      // 設置為 visible
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'visible',
      });
      document.dispatchEvent(new Event('visibilitychange'));

      expect(client.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'visibility',
          message: expect.stringContaining('Page visible'),
          data: expect.objectContaining({
            state: 'visible',
            previousState: 'hidden',
          }),
        })
      );

      // 恢复
      // Restore
      // 復元
      // 恢復
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'visible',
      });
    });
  });

  describe('error handling', () => {
    it('should not throw if client is null', () => {
      plugin.setup(client);
      plugin.teardown();
      
      const button = document.createElement('button');
      document.body.appendChild(button);
      
      expect(() => {
        button.click();
      }).not.toThrow();
      
      document.body.removeChild(button);
    });

    it('should handle errors in event handlers gracefully', () => {
      vi.spyOn(client, 'addBreadcrumb').mockImplementation(() => {
        throw new Error('Breadcrumb error');
      });

      plugin.setup(client);

      const button = document.createElement('button');
      document.body.appendChild(button);

      expect(() => {
        button.click();
      }).not.toThrow();

      document.body.removeChild(button);
    });
  });
});
