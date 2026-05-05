/**
 * Authentication E2E Tests
 * 
 * @description_zh 认证功能端到端测试
 * @description_en Authentication end-to-end tests
 * @description_ja 認証機能エンドツーエンドテスト
 * @description_tw 認證功能端對端測試
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Rewind/);
    await expect(page.locator('h1')).toContainText('登录');
  });

  test('should show validation errors for empty form', async ({ page }) => {
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    
    await expect(page.locator('.ant-form-item-explain-error')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.ant-message-error')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'admin@rewind.dev');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Should redirect to project list
    await expect(page).toHaveURL('/projects');
    await expect(page.locator('h1')).toContainText('项目列表');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', 'admin@rewind.dev');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/projects');
    
    // Logout
    await page.click('.ant-dropdown-trigger');
    await page.click('text=退出登录');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});