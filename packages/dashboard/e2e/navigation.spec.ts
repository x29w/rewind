/**
 * Navigation E2E Tests
 * 
 * @description_zh 导航功能端到端测试
 * @description_en Navigation end-to-end tests
 * @description_ja ナビゲーション機能エンドツーエンドテスト
 * @description_tw 導航功能端對端測試
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@rewind.dev');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/projects');
  });

  test('should navigate between main sections', async ({ page }) => {
    // Navigate to first project
    await page.click('.ant-card').first();
    
    // Test sidebar navigation
    const sidebarItems = [
      { text: '问题列表', url: /\/issues/ },
      { text: 'API 监控', url: /\/api-monitoring/ },
      { text: '白屏检测', url: /\/blank-screen/ },
      { text: 'AI 分析', url: /\/ai-analysis/ },
      { text: '告警配置', url: /\/alert-config/ }
    ];

    for (const item of sidebarItems) {
      await page.click(`text=${item.text}`);
      await expect(page).toHaveURL(item.url);
      await expect(page.locator('h1')).toContainText(item.text);
    }
  });

  test('should handle breadcrumb navigation', async ({ page }) => {
    // Navigate to project
    await page.click('.ant-card').first();
    
    // Navigate to issue detail
    await page.waitForSelector('.ant-table-tbody tr');
    await page.click('.ant-table-tbody tr').first();
    
    // Check breadcrumb
    await expect(page.locator('.ant-breadcrumb')).toBeVisible();
    await expect(page.locator('.ant-breadcrumb')).toContainText('项目列表');
    await expect(page.locator('.ant-breadcrumb')).toContainText('问题列表');
    
    // Click breadcrumb to go back
    await page.click('.ant-breadcrumb a:has-text("问题列表")');
    await expect(page).toHaveURL(/\/issues/);
  });

  test('should handle back button navigation', async ({ page }) => {
    // Navigate through pages
    await page.click('.ant-card').first();
    await page.click('text=API 监控');
    
    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL(/\/issues/);
    
    // Use browser forward button
    await page.goForward();
    await expect(page).toHaveURL(/\/api-monitoring/);
  });

  test('should maintain navigation state on refresh', async ({ page }) => {
    // Navigate to specific page
    await page.click('.ant-card').first();
    await page.click('text=AI 分析');
    
    const currentUrl = page.url();
    
    // Refresh page
    await page.reload();
    
    // Should stay on same page
    await expect(page).toHaveURL(currentUrl);
    await expect(page.locator('h1')).toContainText('AI 分析');
  });

  test('should redirect unauthorized access', async ({ page }) => {
    // Logout first
    await page.click('.ant-dropdown-trigger');
    await page.click('text=退出登录');
    
    // Try to access protected route directly
    await page.goto('/projects/test-project/issues');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});