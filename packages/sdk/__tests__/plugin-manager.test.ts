/**
 * PluginManager 单元测试
 * PluginManager Unit Tests
 * PluginManager ユニットテスト
 * PluginManager 單元測試
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PluginManager, type Plugin } from '../src/core/plugin-manager';
import type { Client } from '../src/core/types/index.d';

describe('PluginManager', () => {
  let manager: PluginManager;
  let mockClient: Client;

  beforeEach(() => {
    manager = new PluginManager();
    mockClient = {
      config: { debug: false } as any,
      captureError: vi.fn(),
      addBreadcrumb: vi.fn(),
      sendEvent: vi.fn(),
    };
  });

  describe('register', () => {
    it('should register a plugin', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        setup: vi.fn(),
      };

      manager.register(plugin);
      expect(manager.hasPlugin('test-plugin')).toBe(true);
    });

    it('should not register duplicate plugins', () => {
      const plugin1: Plugin = { name: 'test', setup: vi.fn() };
      const plugin2: Plugin = { name: 'test', setup: vi.fn() };

      manager.register(plugin1);
      manager.register(plugin2);

      expect(manager.getPlugins()).toHaveLength(1);
    });

    it('should not register after initialization', () => {
      const plugin: Plugin = { name: 'test', setup: vi.fn() };

      manager.setupAll(mockClient);
      manager.register(plugin);

      expect(manager.hasPlugin('test')).toBe(false);
    });
  });

  describe('setupAll', () => {
    it('should initialize all plugins', () => {
      const plugin1: Plugin = { name: 'plugin1', setup: vi.fn() };
      const plugin2: Plugin = { name: 'plugin2', setup: vi.fn() };

      manager.register(plugin1);
      manager.register(plugin2);
      manager.setupAll(mockClient);

      expect(plugin1.setup).toHaveBeenCalledWith(mockClient);
      expect(plugin2.setup).toHaveBeenCalledWith(mockClient);
    });

    it('should handle plugin setup errors', () => {
      const errorPlugin: Plugin = {
        name: 'error-plugin',
        setup: () => {
          throw new Error('Setup failed');
        },
      };

      manager.register(errorPlugin);
      expect(() => manager.setupAll(mockClient)).not.toThrow();
    });

    it('should not initialize twice', () => {
      const plugin: Plugin = { name: 'test', setup: vi.fn() };

      manager.register(plugin);
      manager.setupAll(mockClient);
      manager.setupAll(mockClient);

      expect(plugin.setup).toHaveBeenCalledTimes(1);
    });
  });

  describe('teardownAll', () => {
    it('should teardown all plugins in reverse order', () => {
      const order: string[] = [];
      const plugin1: Plugin = {
        name: 'plugin1',
        setup: vi.fn(),
        teardown: () => order.push('plugin1'),
      };
      const plugin2: Plugin = {
        name: 'plugin2',
        setup: vi.fn(),
        teardown: () => order.push('plugin2'),
      };

      manager.register(plugin1);
      manager.register(plugin2);
      manager.setupAll(mockClient);
      manager.teardownAll();

      expect(order).toEqual(['plugin2', 'plugin1']);
    });

    it('should handle plugins without teardown', () => {
      const plugin: Plugin = { name: 'test', setup: vi.fn() };

      manager.register(plugin);
      manager.setupAll(mockClient);

      expect(() => manager.teardownAll()).not.toThrow();
    });

    it('should handle teardown errors', () => {
      const errorPlugin: Plugin = {
        name: 'error-plugin',
        setup: vi.fn(),
        teardown: () => {
          throw new Error('Teardown failed');
        },
      };

      manager.register(errorPlugin);
      manager.setupAll(mockClient);

      expect(() => manager.teardownAll()).not.toThrow();
    });
  });

  describe('getPlugin', () => {
    it('should return plugin by name', () => {
      const plugin: Plugin = { name: 'test', setup: vi.fn() };

      manager.register(plugin);

      expect(manager.getPlugin('test')).toBe(plugin);
    });

    it('should return undefined for non-existent plugin', () => {
      expect(manager.getPlugin('non-existent')).toBeUndefined();
    });
  });

  describe('getPlugins', () => {
    it('should return copy of plugins array', () => {
      const plugin: Plugin = { name: 'test', setup: vi.fn() };

      manager.register(plugin);
      const plugins = manager.getPlugins();

      expect(plugins).toHaveLength(1);
      expect(plugins).not.toBe(manager.getPlugins()); // Different array instance
    });
  });
});
