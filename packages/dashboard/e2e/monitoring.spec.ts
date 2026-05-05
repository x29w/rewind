/**
 * Monitoring Features E2E Tests
 * 
 * @description_zh 监控功能端到端测试
 * @description_en Monitoring features end-to-end tests
 * @description_ja 監視機能エンドツーエンドテスト
 * @description_tw 監控功能端對端測試
 */

import { test, expect } from '@playwright/test';

test.describe('Monitoring Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to project
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@rewind.dev');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/projects');
    await page.click('.ant-card').first();
  });

  test('should display API monitoring page', async ({ page }) => {
    await page.click('text=API 监控');
    await expect(page).toHaveURL(/\/projects\/.*\/api-monitoring/);
    await expect(page.locator('h1')).toContainText('API 监控');
  });

  test('should show API performance metrics', async ({ page }) => {
    await page.click('text=API 监控');
    
    // Check if charts are rendered
    await expect(page.locator('.ant-card')).toBeVisible();
    await expect(page.locator('text=响应时间')).toBeVisible();
    await expect(page.locator('text=成功率')).toBeVisible();
  });

  test('should display blank screen detection page', async ({ page }) => {
    await page.click('text=白屏检测');
    await expect(page).toHaveURL(/\/projects\/.*\/blank-screen/);
    await expect(page.locator('h1')).toContainText('白屏检测');
  });

  test('should show blank screen incidents', async ({ page }) => {
    await page.click('text=白屏检测');
    
    // Check if incidents table is visible
    await expect(page.locator('.ant-table')).toBeVisible();
    await expect(page.locator('text=检测时间')).toBeVisible();
    await expect(page.locator('text=页面URL')).toBeVisible();
  });

  test('should navigate to AI analysis page', async ({ page }) => {
    await page.click('text=AI 分析');
    await expect(page).toHaveURL(/\/projects\/.*\/ai-analysis/);
    await expect(page.locator('h1')).toContainText('AI 分析');
  });

  test('should display AI analysis results', async ({ page }) => {
    await page.click('text=AI 分析');
    
    // Check if analysis cards are visible
    await expect(page.locator('.ant-card')).toBeVisible();
    await expect(page.locator('text=分析摘要')).toBeVisible();
  });

  test('should access alert configuration', async ({ page }) => {
    await page.click('text=告警配置');
    await expect(page).toHaveURL(/\/projects\/.*\/alert-config/);
    await expect(page.locator('h1')).toContainText('告警配置');
  });

  test('should create new alert rule', async ({ page }) => {
    await page.click('text=告警配置');
    
    // Click create button
    await page.click('button:has-text("新建规则")');
    
    // Fill form
    await page.fill('input[name="name"]', 'Test Alert Rule');
    await page.selectOption('select[name="type"]', 'error_rate');
    await page.fill('input[name="threshold"]', '0.05');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check if rule is created
    await expect(page.locator('text=Test Alert Rule')).toBeVisible();
  });
});