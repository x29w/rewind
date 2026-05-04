/**
 * Client 单元测试
 * Client Unit Tests
 * クライアントユニットテスト
 * 客戶端單元測試
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { init, captureError, addBreadcrumb } from '../src/core/client';

describe('SDK Client', () => {
  beforeEach(() => {
    // Reset client instance before each test
    // @ts-ignore - accessing private variable for testing
    global.clientInstance = null;
  });
  
  describe('init', () => {
    it('should initialize with required config', () => {
      const client = init({
        dsn: 'https://example.com/api/v1/report',
        appId: 'test-app',
        appVersion: '1.0.0'
      });
      
      expect(client).toBeDefined();
      expect(client.config.dsn).toBe('https://example.com/api/v1/report');
      expect(client.config.appId).toBe('test-app');
    });
    
    it('should warn if already initialized', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      
      init({
        dsn: 'https://example.com/api/v1/report',
        appId: 'test-app',
        appVersion: '1.0.0'
      });
      
      init({
        dsn: 'https://example.com/api/v1/report',
        appId: 'test-app',
        appVersion: '1.0.0'
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('[Rewind SDK] Already initialized');
    });
  });
  
  describe('captureError', () => {
    it('should warn if not initialized', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      
      captureError(new Error('Test error'));
      
      expect(consoleSpy).toHaveBeenCalledWith('[Rewind SDK] Not initialized. Call init() first.');
    });
  });
  
  describe('addBreadcrumb', () => {
    it('should warn if not initialized', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      
      addBreadcrumb({
        type: 'click',
        level: 'info',
        message: 'Button clicked',
        timestamp: Date.now()
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('[Rewind SDK] Not initialized. Call init() first.');
    });
  });
});
