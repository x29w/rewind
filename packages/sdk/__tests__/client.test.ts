/**
 * Client 类单元测试
 * Client Class Unit Tests
 * Client クラスユニットテスト
 * Client 類單元測試
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Client } from '../src/core/client';
import type { Breadcrumb } from '@rewind-dev/shared';

describe('Client', () => {
  beforeEach(() => {
    // 重置单例
    // Reset singleton
    // シングルトンをリセット
    // 重置單例
    const instance = Client.getInstance();
    if (instance) {
      instance.destroy();
    }
  });

  afterEach(() => {
    // 清理
    // Cleanup
    // クリーンアップ
    // 清理
    const instance = Client.getInstance();
    if (instance) {
      instance.destroy();
    }
  });

  describe('Singleton Pattern', () => {
    it('should create singleton instance', () => {
      const client1 = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
      });

      const client2 = Client.getInstance();

      expect(client1).toBe(client2);
    });

    it('should not create new instance if already initialized', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const client1 = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
      });

      const client2 = Client.init({
        dsn: 'https://example2.com',
        appId: 'test-app-2',
        appVersion: '2.0.0',
      });

      expect(client1).toBe(client2);
      expect(client1.config.dsn).toBe('https://example.com');
      expect(consoleSpy).toHaveBeenCalledWith('[Rewind SDK] SDK is already initialized');

      consoleSpy.mockRestore();
    });

    it('should return null when getInstance called before init', () => {
      const instance = Client.getInstance();
      expect(instance).toBeNull();
    });
  });

  describe('Configuration', () => {
    it('should resolve config with defaults', () => {
      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
      });

      expect(client.config.dsn).toBe('https://example.com');
      expect(client.config.appId).toBe('test-app');
      expect(client.config.appVersion).toBe('1.0.0');
      expect(client.config.environment).toBe('production');
      expect(client.config.sampleRate).toBe(1.0);
      expect(client.config.maxBreadcrumbs).toBe(50);
      expect(client.config.enabled).toBe(true);
      expect(client.config.debug).toBe(false);
    });

    it('should use custom config values', () => {
      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
        environment: 'development',
        sampleRate: 0.5,
        maxBreadcrumbs: 100,
        enabled: false,
        debug: true,
      });

      expect(client.config.environment).toBe('development');
      expect(client.config.sampleRate).toBe(0.5);
      expect(client.config.maxBreadcrumbs).toBe(100);
      expect(client.config.enabled).toBe(false);
      expect(client.config.debug).toBe(true);
    });

    it('should handle user and tags in config', () => {
      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
        tags: {
          version: 'v1',
          env: 'prod',
        },
      });

      expect(client.config.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
      });
      expect(client.config.tags).toEqual({
        version: 'v1',
        env: 'prod',
      });
    });
  });

  describe('Session ID', () => {
    it('should generate session ID', () => {
      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
      });

      const sessionId = client.getSessionId();
      expect(sessionId).toBeTruthy();
      expect(typeof sessionId).toBe('string');
      expect(sessionId).toMatch(/^\d+-[a-z0-9]+$/);
    });

    it('should generate unique session IDs', () => {
      const client1 = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
      });
      const sessionId1 = client1.getSessionId();
      client1.destroy();

      const client2 = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
      });
      const sessionId2 = client2.getSessionId();

      expect(sessionId1).not.toBe(sessionId2);
    });
  });

  describe('Breadcrumbs', () => {
    it('should add breadcrumb', () => {
      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
      });

      const breadcrumb: Breadcrumb = {
        type: 'click',
        level: 'info',
        message: 'Button clicked',
        timestamp: Date.now(),
      };

      client.addBreadcrumb(breadcrumb);

      const breadcrumbs = client.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0]).toEqual(breadcrumb);
    });

    it('should not add breadcrumb when disabled', () => {
      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
        enabled: false,
      });

      const breadcrumb: Breadcrumb = {
        type: 'click',
        level: 'info',
        message: 'Button clicked',
        timestamp: Date.now(),
      };

      client.addBreadcrumb(breadcrumb);

      const breadcrumbs = client.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(0);
    });

    it('should respect maxBreadcrumbs limit', () => {
      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
        maxBreadcrumbs: 3,
      });

      for (let i = 0; i < 5; i++) {
        client.addBreadcrumb({
          type: 'click',
          level: 'info',
          message: `Click ${i}`,
          timestamp: Date.now() + i,
        });
      }

      const breadcrumbs = client.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0].message).toBe('Click 2');
      expect(breadcrumbs[2].message).toBe('Click 4');
    });
  });

  describe('User Management', () => {
    it('should set user', () => {
      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
      });

      const user = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
      };

      client.setUser(user);

      expect(client.getUser()).toEqual(user);
    });

    it('should update user', () => {
      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
        user: {
          id: 'user-1',
        },
      });

      expect(client.getUser()).toEqual({ id: 'user-1' });

      client.setUser({
        id: 'user-2',
        email: 'new@example.com',
      });

      expect(client.getUser()).toEqual({
        id: 'user-2',
        email: 'new@example.com',
      });
    });
  });

  describe('Tags Management', () => {
    it('should set tags', () => {
      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
      });

      client.setTags({
        version: 'v1',
        env: 'prod',
      });

      expect(client.config.tags).toEqual({
        version: 'v1',
        env: 'prod',
      });
    });

    it('should merge tags', () => {
      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
        tags: {
          initial: 'value',
        },
      });

      client.setTags({
        version: 'v1',
      });

      expect(client.config.tags).toEqual({
        initial: 'value',
        version: 'v1',
      });
    });
  });

  describe('Device and Network Info', () => {
    it('should set and get device info', () => {
      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
      });

      const deviceInfo = {
        userAgent: 'Mozilla/5.0',
        browser: 'Chrome',
        browserVersion: '120.0',
        os: 'Windows',
        osVersion: '10',
        deviceType: 'desktop' as const,
        screenWidth: 1920,
        screenHeight: 1080,
      };

      client.setDeviceInfo(deviceInfo);

      expect(client.getDeviceInfo()).toEqual(deviceInfo);
    });

    it('should set and get network info', () => {
      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
      });

      const networkInfo = {
        effectiveType: '4g' as const,
        downlink: 10,
        rtt: 50,
        saveData: false,
      };

      client.setNetworkInfo(networkInfo);

      expect(client.getNetworkInfo()).toEqual(networkInfo);
    });
  });

  describe('Error Capture', () => {
    it('should capture error', () => {
      // Mock navigator.sendBeacon
      const sendBeaconSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'sendBeacon', {
        value: sendBeaconSpy,
        writable: true,
      });

      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
      });

      const error = new Error('Test error');
      client.captureError(error);

      expect(sendBeaconSpy).toHaveBeenCalled();
    });

    it('should not capture error when disabled', () => {
      const sendBeaconSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'sendBeacon', {
        value: sendBeaconSpy,
        writable: true,
      });

      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
        enabled: false,
      });

      const error = new Error('Test error');
      client.captureError(error);

      expect(sendBeaconSpy).not.toHaveBeenCalled();
    });

    it('should include extra context in error', () => {
      const sendBeaconSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'sendBeacon', {
        value: sendBeaconSpy,
        writable: true,
      });

      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
      });

      const error = new Error('Test error');
      client.captureError(error, { userId: '123', action: 'submit' });

      expect(sendBeaconSpy).toHaveBeenCalled();
      const blob = sendBeaconSpy.mock.calls[0][1] as Blob;
      
      // Read blob content
      const reader = new FileReader();
      reader.onload = () => {
        const payload = JSON.parse(reader.result as string);
        expect(payload.data.userId).toBe('123');
        expect(payload.data.action).toBe('submit');
      };
      reader.readAsText(blob);
    });
  });

  describe('Sampling', () => {
    it('should respect sample rate', () => {
      const sendBeaconSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'sendBeacon', {
        value: sendBeaconSpy,
        writable: true,
      });

      // Mock Math.random to always return 0.6
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.6);

      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
        sampleRate: 0.5, // 50% sample rate
      });

      const error = new Error('Test error');
      client.captureError(error);

      // 0.6 > 0.5, should not send
      expect(sendBeaconSpy).not.toHaveBeenCalled();

      randomSpy.mockRestore();
    });

    it('should send when within sample rate', () => {
      const sendBeaconSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'sendBeacon', {
        value: sendBeaconSpy,
        writable: true,
      });

      // Mock Math.random to always return 0.3
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.3);

      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
        sampleRate: 0.5, // 50% sample rate
      });

      const error = new Error('Test error');
      client.captureError(error);

      // 0.3 < 0.5, should send
      expect(sendBeaconSpy).toHaveBeenCalled();

      randomSpy.mockRestore();
    });
  });

  describe('Destroy', () => {
    it('should destroy client', () => {
      const client = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
      });

      client.addBreadcrumb({
        type: 'click',
        level: 'info',
        message: 'Test',
        timestamp: Date.now(),
      });

      expect(client.getBreadcrumbs()).toHaveLength(1);

      client.destroy();

      expect(Client.getInstance()).toBeNull();
    });

    it('should allow re-initialization after destroy', () => {
      const client1 = Client.init({
        dsn: 'https://example.com',
        appId: 'test-app',
        appVersion: '1.0.0',
      });

      const sessionId1 = client1.getSessionId();
      client1.destroy();

      const client2 = Client.init({
        dsn: 'https://example2.com',
        appId: 'test-app-2',
        appVersion: '2.0.0',
      });

      const sessionId2 = client2.getSessionId();

      expect(client2.config.dsn).toBe('https://example2.com');
      expect(sessionId1).not.toBe(sessionId2);
    });
  });
});
