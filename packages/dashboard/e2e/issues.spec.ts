/**
 * Issues Management E2E Tests
 * 
 * @description_zh 问题管理端到端测试
 * @description_en Issues management end-to-end tests
 * @description_ja 問題管理エンドツーエンドテスト
 * @description_tw 問題管理端對端測試
 */

import { test, expect } from '@playwright/test';

test.describe('Issues Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@rewind.dev');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/projects');
    
    // Navigate to first project's issues
    await page.click('.ant-card').first();
    await expect(page).toHaveURL(/\/projects\/.*\/issues/);
  });

  test('should display issues list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('问题列表');
    await expect(page.locator('.ant-table')).toBeVisible();
  });

  test('should filter issues by level', async ({ page }) => {
    // Click on error level filter
    await page.click('.ant-select-selector');
    await page.click('text=错误');
    
    // Check if filter is applied
    await expect(page.locator('.ant-select-selection-item')).toContainText('错误');
    
    // Verify table updates
    await page.waitForTimeout(1000);
    const rows = page.locator('.ant-table-tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('should search issues', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="搜索"]');
    await searchInput.fill('TypeError');
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(1000);
    
    // Check if search results are displayed
    const tableRows = page.locator('.ant-table-tbody tr');
    if (await tableRows.count() > 0) {
      await expect(tableRows.first()).toContainText('TypeError');
    }
  });

  test('should navigate to issue detail', async ({ page }) => {
    // Wait for issues to load
    await page.waitForSelector('.ant-table-tbody tr');
    
    // Click on first issue
    await page.click('.ant-table-tbody tr').first();
    
    // Should navigate to issue detail page
    await expect(page).toHaveURL(/\/projects\/.*\/issues\/.*/);
    await expect(page.locator('h1')).toContainText('问题详情');
  });

  test('should display issue details correctly', async ({ page }) => {
    // Navigate to issue detail
    await page.waitForSelector('.ant-table-tbody tr');
    await page.click('.ant-table-tbody tr').first();
    
    // Check if all sections are present
    await expect(page.locator('text=错误信息')).toBeVisible();
    await expect(page.locator('text=堆栈跟踪')).toBeVisible();
    await expect(page.locator('text=用户操作')).toBeVisible();
    await expect(page.locator('text=设备信息')).toBeVisible();
  });

  test('should trigger AI analysis', async ({ page }) => {
    // Navigate to issue detail
    await page.waitForSelector('.ant-table-tbody tr');
    await page.click('.ant-table-tbody tr').first();
    
    // Click AI analysis button
    const aiButton = page.locator('button:has-text("AI 分析")');
    if (await aiButton.isVisible()) {
      await aiButton.click();
      
      // Check if analysis section appears
      await expect(page.locator('text=AI 分析结果')).toBeVisible();
    }
  });
});