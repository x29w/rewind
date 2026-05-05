/**
 * BreadcrumbManager 单元测试
 * BreadcrumbManager Unit Tests
 * BreadcrumbManager ユニットテスト
 * BreadcrumbManager 單元測試
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BreadcrumbManager } from '../src/core/breadcrumb-manager';
import type { Breadcrumb } from '@rewind-dev/shared';

describe('BreadcrumbManager', () => {
  let manager: BreadcrumbManager;

  beforeEach(() => {
    manager = new BreadcrumbManager(3);
  });

  it('should initialize with correct size', () => {
    expect(manager.getSize()).toBe(0);
  });

  it('should add breadcrumbs', () => {
    const crumb: Breadcrumb = {
      type: 'click',
      level: 'info',
      message: 'Button clicked',
      timestamp: Date.now(),
    };

    manager.push(crumb);
    expect(manager.getSize()).toBe(1);
  });

  it('should maintain fixed size buffer', () => {
    manager.push({ type: 'click', level: 'info', message: '1', timestamp: 1 });
    manager.push({ type: 'click', level: 'info', message: '2', timestamp: 2 });
    manager.push({ type: 'click', level: 'info', message: '3', timestamp: 3 });
    manager.push({ type: 'click', level: 'info', message: '4', timestamp: 4 });

    const snapshot = manager.snapshot();
    expect(snapshot).toHaveLength(3);
    expect(snapshot[0].message).toBe('2'); // 最旧的被覆盖
    expect(snapshot[1].message).toBe('3');
    expect(snapshot[2].message).toBe('4');
  });

  it('should return empty array when no breadcrumbs', () => {
    const snapshot = manager.snapshot();
    expect(snapshot).toEqual([]);
  });

  it('should return correct snapshot when buffer not full', () => {
    manager.push({ type: 'click', level: 'info', message: '1', timestamp: 1 });
    manager.push({ type: 'navigation', level: 'info', message: '2', timestamp: 2 });

    const snapshot = manager.snapshot();
    expect(snapshot).toHaveLength(2);
    expect(snapshot[0].message).toBe('1');
    expect(snapshot[1].message).toBe('2');
  });

  it('should clear all breadcrumbs', () => {
    manager.push({ type: 'click', level: 'info', message: '1', timestamp: 1 });
    manager.push({ type: 'click', level: 'info', message: '2', timestamp: 2 });

    manager.clear();
    expect(manager.getSize()).toBe(0);
    expect(manager.snapshot()).toEqual([]);
  });

  it('should handle circular buffer correctly', () => {
    // 填满缓冲区
    for (let i = 1; i <= 5; i++) {
      manager.push({
        type: 'click',
        level: 'info',
        message: `Item ${i}`,
        timestamp: i,
      });
    }

    const snapshot = manager.snapshot();
    expect(snapshot).toHaveLength(3);
    expect(snapshot[0].message).toBe('Item 3');
    expect(snapshot[1].message).toBe('Item 4');
    expect(snapshot[2].message).toBe('Item 5');
  });

  it('should support different breadcrumb types', () => {
    manager.push({ type: 'click', level: 'info', message: 'Click', timestamp: 1 });
    manager.push({ type: 'navigation', level: 'info', message: 'Nav', timestamp: 2 });
    manager.push({ type: 'xhr', level: 'info', message: 'XHR', timestamp: 3 });

    const snapshot = manager.snapshot();
    expect(snapshot[0].type).toBe('click');
    expect(snapshot[1].type).toBe('navigation');
    expect(snapshot[2].type).toBe('xhr');
  });
});
