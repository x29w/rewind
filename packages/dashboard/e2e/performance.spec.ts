/**
 * Performance Benchmark E2E Tests
 * 
 * @description_zh 性能基准端到端测试
 * @description_en Performance benchmark end-to-end tests
 * @description_ja パフォーマンスベンチマークエンドツーエンドテスト
 * @description_tw 效能基準端對端測試
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Benchmarks', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@rewind.dev');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/projects');
  });

  test('should load project list within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
            if (entry.name === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
          });
          
          resolve(vitals);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 5000);
      });
    });
    
    console.log('Performance Metrics:', metrics);
  });

  test('should handle large issue lists efficiently', async ({ page }) => {
    // Navigate to project with many issues
    await page.click('.ant-card').first();
    
    const startTime = Date.now();
    
    // Wait for table to load
    await page.waitForSelector('.ant-table-tbody tr');
    
    const loadTime = Date.now() - startTime;
    
    // Should load issue list within 2 seconds
    expect(loadTime).toBeLessThan(2000);
    
    // Check if pagination is working efficiently
    if (await page.locator('.ant-pagination').isVisible()) {
      const paginationStartTime = Date.now();
      
      await page.click('.ant-pagination-next');
      await page.waitForSelector('.ant-table-tbody tr');
      
      const paginationTime = Date.now() - paginationStartTime;
      
      // Pagination should be fast
      expect(paginationTime).toBeLessThan(1000);
    }
  });

  test('should render charts without performance issues', async ({ page }) => {
    await page.click('.ant-card').first();
    await page.click('text=API 监控');
    
    const startTime = Date.now();
    
    // Wait for charts to render
    await page.waitForSelector('.ant-card .ant-card-body', { timeout: 10000 });
    
    const renderTime = Date.now() - startTime;
    
    // Charts should render within 5 seconds
    expect(renderTime).toBeLessThan(5000);
    
    // Check if charts are interactive
    const chartElements = await page.locator('canvas, svg').count();
    expect(chartElements).toBeGreaterThan(0);
  });

  test('should handle real-time updates efficiently', async ({ page }) => {
    await page.click('.ant-card').first();
    
    // Monitor network requests
    const requests = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        requests.push({
          url: request.url(),
          timestamp: Date.now()
        });
      }
    });
    
    // Stay on page for 10 seconds to observe real-time updates
    await page.waitForTimeout(10000);
    
    // Should not have excessive API calls
    const apiCalls = requests.length;
    console.log(`API calls in 10 seconds: ${apiCalls}`);
    
    // Should not exceed 10 API calls in 10 seconds for real-time updates
    expect(apiCalls).toBeLessThan(10);
  });

  test('should maintain responsive design performance', async ({ page }) => {
    await page.click('.ant-card').first();
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1366, height: 768 },  // Laptop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      const startTime = Date.now();
      await page.waitForLoadState('networkidle');
      
      const resizeTime = Date.now() - startTime;
      
      // Responsive adjustments should be fast
      expect(resizeTime).toBeLessThan(1000);
      
      // Check if layout is not broken
      const sidebar = page.locator('.ant-layout-sider');
      const content = page.locator('.ant-layout-content');
      
      await expect(sidebar).toBeVisible();
      await expect(content).toBeVisible();
    }
  });

  test('should handle memory usage efficiently', async ({ page }) => {
    await page.click('.ant-card').first();
    
    // Navigate through different pages to test memory leaks
    const pages = [
      'text=问题列表',
      'text=API 监控',
      'text=白屏检测',
      'text=AI 分析',
      'text=告警配置'
    ];
    
    for (let i = 0; i < 3; i++) { // Repeat 3 times
      for (const pageLink of pages) {
        await page.click(pageLink);
        await page.waitForLoadState('networkidle');
        
        // Check memory usage (basic check)
        const memoryInfo = await page.evaluate(() => {
          if ('memory' in performance) {
            return {
              usedJSHeapSize: performance.memory.usedJSHeapSize,
              totalJSHeapSize: performance.memory.totalJSHeapSize,
              jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
          }
          return null;
        });
        
        if (memoryInfo) {
          console.log(`Memory usage on ${pageLink}:`, memoryInfo);
          
          // Memory usage should not exceed 100MB
          expect(memoryInfo.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
        }
      }
    }
  });

  test('should handle concurrent user actions', async ({ page, context }) => {
    // Simulate concurrent actions
    const promises = [];
    
    // Open multiple tabs
    for (let i = 0; i < 3; i++) {
      const newPage = await context.newPage();
      
      promises.push(
        (async () => {
          await newPage.goto('/login');
          await newPage.fill('input[name="email"]', 'admin@rewind.dev');
          await newPage.fill('input[name="password"]', 'admin123');
          await newPage.click('button[type="submit"]');
          await newPage.waitForURL('/projects');
          await newPage.click('.ant-card').first();
          await newPage.waitForLoadState('networkidle');
          await newPage.close();
        })()
      );
    }
    
    const startTime = Date.now();
    await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    
    // Concurrent operations should complete within reasonable time
    expect(totalTime).toBeLessThan(15000); // 15 seconds for 3 concurrent logins
  });
});