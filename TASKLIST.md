# Rewind 完整开发任务清单

> 更新时间：2026-05-04  
> 项目周期：10 周  
> 当前阶段：P0-a (Week 1-2)

---

## 📊 总体进度

**整体完成度**: 15% (2/13 阶段完成)

- ✅ P0-a-1: Monorepo 基础搭建 - **100%**
- ✅ P0-a-2: Dashboard 修复 - **100%**
- 🚧 P0-b: SDK 核心实现 - **10%**
- ⏳ P0-c: Server 基础实现 - **0%**
- ⏳ P0-d: Dashboard 基础实现 - **0%**
- ⏳ P0-e: Issue 列表页 - **0%**
- ⏳ P0-f: Issue 详情页 - **0%**
- ⏳ P1-a: 白屏检测 - **0%**
- ⏳ P1-b: API 监控 - **0%**
- ⏳ P1-c: AI 分析 - **0%**
- ⏳ P1-d: 智能告警 - **0%**
- ⏳ P2-a: 性能优化 - **0%**
- ⏳ P2-b: 最终交付 - **0%**

---

## ✅ P0-a-1: Monorepo 基础搭建 (已完成)

- [x] 安装 pnpm
- [x] 配置 pnpm workspace
- [x] 配置 Turborepo
- [x] 创建 4 个包的基础结构
- [x] 安装所有依赖
- [x] 修复类型导出问题
- [x] 清理 src 目录中的 .js 文件

---

## ✅ P0-a-2: Dashboard 修复 (已完成)

- [x] 修复 TanStack Router 类型问题
- [x] 验证 Dashboard 构建成功
- [x] 测试 `pnpm build` 命令 - 所有 4 个包构建成功

---

## � P0-b: SDK 核心实现 (Week 1-2, 3天)

### 核心类实现
- [ ] 实现 Client 类（单例模式）
- [ ] 实现 PluginManager（插件管理）
- [x] 实现 BreadcrumbManager（循环缓冲区）

### 插件实现
- [ ] 实现 Error Plugin（错误捕获）
  - [ ] window.onerror 劫持
  - [ ] unhandledrejection 监听
  - [ ] 资源加载错误捕获
- [ ] 实现 Behavior Plugin（行为记录）
  - [ ] 点击事件监听
  - [ ] 路由变化监听
  - [ ] 输入事件监听
  - [ ] 可见性变化监听

### 工具函数
- [ ] 实现设备信息采集
- [ ] 实现网络信息采集
- [ ] 实现会话 ID 生成
- [ ] 实现 DOM 工具函数
- [ ] 实现 URL 脱敏

### 测试
- [ ] 编写 Client 单元测试
- [ ] 编写 PluginManager 单元测试
- [x] 编写 BreadcrumbManager 单元测试 (8/8 通过)
- [ ] 编写 Error Plugin 测试
- [ ] 编写 Behavior Plugin 测试
- [ ] 确保测试覆盖率 > 80%

### 构建验证
- [ ] 验证 UMD 构建产物
- [ ] 验证 ESM 构建产物
- [ ] 验证 gzip 大小 < 15KB

---

## ⏳ P0-c: Server 基础实现 (Week 1-2, 2天)

### 数据库配置
- [ ] 配置 Prisma schema
- [ ] 创建 Event 表
- [ ] 创建 Issue 表
- [ ] 创建 Breadcrumb 表
- [ ] 创建 User 表
- [ ] 创建 Project 表
- [ ] 运行数据库迁移

### Redis & BullMQ
- [ ] 配置 Redis 连接
- [ ] 配置 BullMQ 队列
- [ ] 创建事件处理队列
- [ ] 创建指纹计算队列

### API 实现
- [ ] 创建 IngestionModule
- [ ] 实现 POST /api/v1/report 端点
- [ ] 实现请求验证
- [ ] 实现 rate limiting
- [ ] 实现健康检查端点
- [ ] 实现 CORS 配置

### 测试
- [ ] 编写 Ingestion 单元测试
- [ ] 编写 rate limiting 测试
- [ ] 测试健康检查端点

---

## ⏳ P0-d: Dashboard 基础实现 (Week 1-2, 2天)

### 路由配置
- [ ] 完善 TanStack Router 配置
- [ ] 创建登录页路由
- [ ] 创建项目列表页路由
- [ ] 创建 Issue 列表页路由
- [ ] 创建 Issue 详情页路由

### 布局组件
- [ ] 实现 AppLayout
- [ ] 实现 Sidebar
- [ ] 实现 Header
- [ ] 实现 Breadcrumb 导航

### Redux Store
- [ ] 创建 auth slice
- [ ] 创建 project slice
- [ ] 创建 issue slice
- [ ] 配置 Redux DevTools

### API 层
- [ ] 配置 Axios 实例
- [ ] 实现 API 拦截器
- [ ] 创建 Auth API service
- [ ] 创建 Project API service
- [ ] 创建 Issue API service

### 基础页面
- [ ] 实现登录页
- [ ] 实现项目列表页
- [ ] 实现项目选择器

---

## ⏳ P0-e: Issue 列表页 (Week 3, 3天)

### 列表功能
- [ ] 实现 Issue 列表组件
- [ ] 实现分页功能
- [ ] 实现筛选功能（状态、级别、类型）
- [ ] 实现搜索功能
- [ ] 实现排序功能（时间、用户数、事件数）

### 数据展示
- [ ] 显示 Issue 标题
- [ ] 显示 Issue 级别（fatal/error/warning/info）
- [ ] 显示事件数量
- [ ] 显示用户数量
- [ ] 显示首次/最后出现时间
- [ ] 显示状态标签

### 交互功能
- [ ] 点击跳转详情页
- [ ] 批量操作（标记已解决、忽略）
- [ ] 状态切换

---

## ⏳ P0-f: Issue 详情页 (Week 3-4, 4天)

### 基础信息
- [ ] 显示 Issue 标题和消息
- [ ] 显示错误堆栈
- [ ] 显示发生次数统计
- [ ] 显示影响用户数
- [ ] 显示首次/最后出现时间

### 事件列表
- [ ] 显示最近事件列表
- [ ] 实现事件分页
- [ ] 显示事件时间线

### 面包屑展示
- [ ] 显示用户操作路径
- [ ] 时间线可视化
- [ ] 点击事件高亮

### 设备信息
- [ ] 显示浏览器信息
- [ ] 显示操作系统信息
- [ ] 显示设备类型
- [ ] 显示屏幕分辨率

### 网络信息
- [ ] 显示网络类型
- [ ] 显示请求记录

### 操作功能
- [ ] 标记为已解决
- [ ] 标记为忽略
- [ ] 添加备注
- [ ] 分配给成员

---

## ⏳ P1-a: 白屏检测 (Week 5, 2天)

### SDK 实现
- [ ] 实现 FCP 超时检测
- [ ] 实现 DOM 采样算法
- [ ] 实现白屏判定逻辑
- [ ] 添加白屏事件上报

### Server 实现
- [ ] 创建白屏事件表
- [ ] 实现白屏事件处理
- [ ] 实现白屏统计

### Dashboard 实现
- [ ] 白屏列表页
- [ ] 白屏详情页
- [ ] 白屏趋势图

---

## ⏳ P1-b: API 监控 (Week 5-6, 3天)

### SDK 实现
- [ ] 劫持 XMLHttpRequest
- [ ] 劫持 Fetch API
- [ ] 记录请求时长
- [ ] 记录请求状态
- [ ] 记录请求参数（脱敏）

### Server 实现
- [ ] 创建 API 错误表
- [ ] 实现 API 错误聚合
- [ ] 实现 API 性能统计

### Dashboard 实现
- [ ] API 错误列表
- [ ] API 性能分析
- [ ] 慢请求排行

---

## ⏳ P1-c: AI 分析 (Week 7-8, 5天)

### 后端实现
- [ ] 集成 OpenAI API
- [ ] 实现错误上下文提取
- [ ] 实现 Prompt 工程
- [ ] 实现分析结果缓存

### 分析功能
- [ ] 错误原因分析
- [ ] 修复建议生成
- [ ] 相似问题推荐

### Dashboard 展示
- [ ] AI 分析结果展示
- [ ] 修复建议卡片
- [ ] 相似问题列表

---

## ⏳ P1-d: 智能告警 (Week 8-9, 4天)

### 告警规则
- [ ] 实现错误数量阈值告警
- [ ] 实现错误率阈值告警
- [ ] 实现新错误告警
- [ ] 实现错误回归告警

### 通知渠道
- [ ] 邮件通知
- [ ] Webhook 通知
- [ ] 企业微信通知
- [ ] 钉钉通知

### Dashboard 配置
- [ ] 告警规则配置页
- [ ] 通知渠道配置页
- [ ] 告警历史页

---

## ⏳ P2-a: 性能优化 (Week 9, 3天)

### SDK 优化
- [ ] 代码压缩优化
- [ ] Tree-shaking 优化
- [ ] 验证 gzip < 15KB
- [ ] 性能测试

### Server 优化
- [ ] 数据库索引优化
- [ ] 查询性能优化
- [ ] Redis 缓存优化
- [ ] 接口性能测试

### Dashboard 优化
- [ ] 代码分割
- [ ] 懒加载优化
- [ ] 图片优化
- [ ] 首屏加载优化

---

## ⏳ P2-b: 最终交付 (Week 9-10, 4天)

### 文档完善
- [ ] 完成 API 文档
- [ ] 完成 SDK 使用文档
- [ ] 完成部署文档
- [ ] 完成用户手册

### 多语言翻译
- [ ] 翻译 PRD（英/日/繁中）
- [ ] 翻译设计文档（英/日/繁中）
- [ ] 翻译开发规范（英/日/繁中）

### 开源准备
- [ ] 设计 Logo
- [ ] 录制 Demo 视频
- [ ] 准备发布文章
- [ ] 准备社交媒体内容

### 测试验收
- [ ] 端到端测试
- [ ] 浏览器兼容性测试
- [ ] 性能测试
- [ ] 安全测试

### 部署上线
- [ ] 配置生产环境
- [ ] 数据库迁移
- [ ] 域名配置
- [ ] SSL 证书配置
- [ ] CDN 配置

---

## 📈 里程碑

| 里程碑 | 时间 | 状态 | 关键交付物 |
|--------|------|------|-----------|
| **M1: 基础搭建** | Week 1-2 | 🚧 进行中 | Monorepo + SDK 核心 + Server 基础 + Dashboard 基础 |
| **M2: 核心功能** | Week 3-4 | ⏳ 待开始 | Issue 列表 + Issue 详情 + 完整数据流 |
| **M3: 高级功能** | Week 5-6 | ⏳ 待开始 | 白屏检测 + API 监控 |
| **M4: AI 增强** | Week 7-9 | ⏳ 待开始 | AI 分析 + 智能告警 |
| **M5: 交付上线** | Week 9-10 | ⏳ 待开始 | 文档 + 测试 + 部署 |

---

## 🎯 当前焦点

**本周目标 (Week 1-2)**: 完成 P0 阶段所有任务

**今日任务**: 
1. 🚧 完成 SDK 核心实现（PluginManager + Error Plugin + Behavior Plugin）
2. ⏳ 开始 Server 基础实现

**下一步**:
- 实现 PluginManager
- 实现 Error Plugin
- 实现 Behavior Plugin

---

## 💡 快速命令

```bash
# 构建所有包
pnpm build

# 运行 SDK 测试
pnpm test --filter=@rewind-dev/sdk

# 启动 Server
pnpm dev:server

# 启动 Dashboard
pnpm dev:dashboard

# 查看测试覆盖率
pnpm test:coverage --filter=@rewind-dev/sdk
```

---

## 📝 备注

- 每完成一个任务，更新此文件的复选框
- 每周结束时更新总体进度百分比
- 遇到阻塞问题及时记录在 NOTES.md
- 重要决策记录在 CHANGELOG.md
