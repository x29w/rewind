# E2E 测试指南

## 概述

本目录包含 Rewind Dashboard 的端到端 (E2E) 测试套件，使用 Playwright 测试框架。

## 测试结构

```
e2e/
├── auth.spec.ts          # 认证功能测试
├── issues.spec.ts        # 问题管理测试
├── monitoring.spec.ts    # 监控功能测试
├── navigation.spec.ts    # 导航功能测试
└── README.md            # 本文档
```

## 运行测试

### 安装依赖

```bash
# 安装 Playwright 浏览器
pnpm test:install
```

### 运行所有测试

```bash
# 无头模式运行
pnpm test:e2e

# 有头模式运行（可视化）
pnpm test:e2e:headed

# 调试模式
pnpm test:e2e:debug

# UI 模式（推荐用于开发）
pnpm test:e2e:ui
```

### 运行特定测试

```bash
# 运行特定测试文件
npx playwright test auth.spec.ts

# 运行特定测试用例
npx playwright test --grep "should login successfully"

# 运行特定浏览器
npx playwright test --project=chromium
```

## 测试覆盖范围

### 认证功能 (auth.spec.ts)
- ✅ 登录页面显示
- ✅ 表单验证
- ✅ 无效凭据处理
- ✅ 成功登录流程
- ✅ 登出功能

### 问题管理 (issues.spec.ts)
- ✅ 问题列表显示
- ✅ 过滤和搜索
- ✅ 问题详情页面
- ✅ AI 分析触发

### 监控功能 (monitoring.spec.ts)
- ✅ API 监控页面
- ✅ 白屏检测功能
- ✅ AI 分析结果
- ✅ 告警配置管理

### 导航功能 (navigation.spec.ts)
- ✅ 侧边栏导航
- ✅ 面包屑导航
- ✅ 浏览器前进后退
- ✅ 页面刷新状态保持
- ✅ 权限控制

## 测试配置

### 浏览器支持
- Chrome/Chromium
- Firefox
- Safari (WebKit)
- Mobile Chrome
- Mobile Safari
- Microsoft Edge

### 测试环境
- **开发环境**: http://localhost:5173
- **API 服务**: http://localhost:3000
- **自动启动**: 测试运行时自动启动开发服务器

## 最佳实践

### 1. 测试数据
- 使用固定的测试账户：`admin@rewind.dev`
- 避免依赖真实数据，使用 Mock 数据
- 每个测试用例应该独立，不依赖其他测试

### 2. 页面对象模式
```typescript
// 推荐使用页面对象模式
class LoginPage {
  constructor(private page: Page) {}
  
  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}
```

### 3. 等待策略
```typescript
// 等待元素可见
await expect(page.locator('.ant-table')).toBeVisible();

// 等待网络请求完成
await page.waitForResponse('**/api/v1/issues');

// 等待页面加载
await page.waitForLoadState('networkidle');
```

### 4. 错误处理
```typescript
test('should handle network errors', async ({ page }) => {
  // 模拟网络错误
  await page.route('**/api/**', route => route.abort());
  
  await page.goto('/issues');
  await expect(page.locator('.ant-message-error')).toBeVisible();
});
```

## 调试技巧

### 1. 截图和录屏
```bash
# 失败时自动截图（已配置）
# 失败时自动录屏（已配置）

# 手动截图
await page.screenshot({ path: 'debug.png' });
```

### 2. 调试模式
```bash
# 逐步调试
pnpm test:e2e:debug

# 在特定行暂停
await page.pause();
```

### 3. 查看测试报告
```bash
# 生成 HTML 报告
npx playwright show-report
```

## CI/CD 集成

### GitHub Actions 示例
```yaml
- name: Install dependencies
  run: pnpm install

- name: Install Playwright browsers
  run: pnpm test:install

- name: Run E2E tests
  run: pnpm test:e2e

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: packages/dashboard/playwright-report/
```

## 故障排查

### 常见问题

1. **测试超时**
   - 增加 `timeout` 配置
   - 检查网络连接
   - 确保服务器正常运行

2. **元素找不到**
   - 检查选择器是否正确
   - 等待元素加载完成
   - 使用更稳定的选择器

3. **浏览器启动失败**
   - 重新安装浏览器：`pnpm test:install`
   - 检查系统依赖

### 日志查看
```bash
# 详细日志
DEBUG=pw:* npx playwright test

# API 请求日志
npx playwright test --trace on
```

---

**最后更新**: 2026-05-05