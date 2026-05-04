---
title: P0-a Server 基础架构
status: pending
priority: high
assignee: agent
estimatedDays: 2
tags: [server, nestjs, database]
dependencies: [p0-a-monorepo-setup]
---

# P0-a Server 基础架构

## 📋 目标

搭建 Server 的基础架构，包括 NestJS 项目初始化、数据库配置、Redis 配置、BullMQ 队列配置，以及数据接收模块。

## 🎯 验收标准

- [ ] NestJS 服务可以正常启动
- [ ] PostgreSQL 数据库连接成功
- [ ] Prisma Schema 定义完成（projects/events 表）
- [ ] Redis 连接成功
- [ ] BullMQ 队列配置完成
- [ ] 数据接收接口可以接收 SDK 上报数据
- [ ] 限流功能正常工作

## 📦 任务列表

### Task 1: NestJS 项目初始化
**状态**: pending  
**预估**: 0.5 天

**子任务**:
- [ ] 创建 NestJS 项目结构
- [ ] 配置 package.json（引用 @rewind-dev/shared）
- [ ] 配置 tsconfig.json
- [ ] 创建 src/main.ts 入口文件
- [ ] 创建 src/app.module.ts
- [ ] 配置环境变量（.env.example）
- [ ] 测试服务启动

**环境变量**:
```env
# .env.example
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rewind

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key

# AI (可选)
AI_ENABLED=false
GEMINI_API_KEY=
GROQ_API_KEY=
```

---

### Task 2: 配置 Prisma
**状态**: pending  
**预估**: 1 天

**子任务**:
- [ ] 安装 Prisma 依赖
- [ ] 初始化 Prisma（prisma init）
- [ ] 创建 prisma/schema.prisma
- [ ] 定义 Project 模型
- [ ] 定义 Event 模型（按月分区）
- [ ] 创建 PrismaModule
- [ ] 创建 PrismaService
- [ ] 生成 Prisma Client
- [ ] 创建初始 Migration
- [ ] 测试数据库连接

**Prisma Schema**:
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  id        String   @id @default(uuid())
  name      String
  appId     String   @unique
  apiKey    String
  settings  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("projects")
}

model Event {
  id            String   @id @default(uuid())
  projectId     String
  type          String
  timestamp     DateTime
  sessionId     String
  userId        String?
  pageUrl       String
  appVersion    String
  environment   String
  device        Json
  data          Json
  breadcrumbs   Json?
  requestContext Json?
  createdAt     DateTime @default(now())

  @@index([projectId, timestamp])
  @@index([sessionId])
  @@map("events")
}
```

---

### Task 3: 配置 Redis
**状态**: pending  
**预估**: 0.5 天

**子任务**:
- [ ] 安装 Redis 依赖（ioredis）
- [ ] 创建 RedisModule
- [ ] 创建 RedisService
- [ ] 配置 Redis 连接
- [ ] 实现健康检查
- [ ] 测试 Redis 连接

**RedisModule**:
```typescript
// src/common/redis/redis.module.ts
import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
```

---

### Task 4: 配置 BullMQ
**状态**: pending  
**预估**: 0.5 天

**子任务**:
- [ ] 安装 BullMQ 依赖（@nestjs/bullmq, bullmq）
- [ ] 配置 BullModule（全局）
- [ ] 注册 event-processing 队列
- [ ] 创建测试 Worker
- [ ] 测试队列功能

**BullMQ 配置**:
```typescript
// src/app.module.ts
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: 'event-processing',
    }),
  ],
})
export class AppModule {}
```

---

### Task 5: 创建 IngestionModule
**状态**: pending  
**预估**: 1 天

**子任务**:
- [ ] 创建 src/modules/ingestion/ 目录
- [ ] 创建 IngestionModule
- [ ] 创建 IngestionController
- [ ] 创建 IngestionService
- [ ] 创建 RateLimiterService
- [ ] 创建 DTO（ReportDto）
- [ ] 实现 POST /api/v1/report 接口
- [ ] 实现 API Key 认证（ApiKeyGuard）
- [ ] 实现限流（Redis 滑动窗口）
- [ ] 数据校验（class-validator）
- [ ] 测试接口

**IngestionController**:
```typescript
// src/modules/ingestion/ingestion.controller.ts
import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { ApiKeyGuard } from '@/common/guards/api-key.guard';
import { ReportDto } from './dto/report.dto';

@Controller('api/v1')
export class IngestionController {
  /**
   * 接收 SDK 上报数据
   * Receive SDK report data
   * SDKレポートデータを受信
   * 接收 SDK 上報數據
   */
  @Post('report')
  @UseGuards(ApiKeyGuard)
  @HttpCode(204)
  async report(@Body() dto: ReportDto) {
    await this.ingestionService.process(dto);
  }
}
```

**限流实现**:
```typescript
// src/modules/ingestion/rate-limiter.service.ts
/**
 * 检查限流
 * Check rate limit
 * レート制限をチェック
 * 檢查限流
 */
async check(appId: string): Promise<boolean> {
  const key = `rate:${appId}`;
  const now = Date.now();
  const window = 60000; // 60s
  const limit = 1000;

  const pipe = this.redis.pipeline();
  pipe.zremrangebyscore(key, 0, now - window);
  pipe.zadd(key, now, `${now}:${Math.random()}`);
  pipe.zcard(key);
  pipe.expire(key, 60);
  
  const results = await pipe.exec();
  const count = results[2][1] as number;
  
  return count <= limit;
}
```

---

### Task 6: 创建全局配置
**状态**: pending  
**预估**: 0.5 天

**子任务**:
- [ ] 创建 src/config/ 目录
- [ ] 创建 ConfigModule（@nestjs/config）
- [ ] 创建配置验证 Schema
- [ ] 创建全局异常过滤器
- [ ] 创建响应拦截器
- [ ] 配置 CORS
- [ ] 配置日志（winston）

**全局异常过滤器**:
```typescript
// src/common/filters/global-exception.filter.ts
/**
 * 全局异常过滤器
 * Global exception filter
 * グローバル例外フィルター
 * 全局異常過濾器
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;
    
    response.status(status).json({
      error: {
        code: this.getErrorCode(exception),
        message: this.getErrorMessage(exception),
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

---

### Task 7: 创建健康检查
**状态**: pending  
**预估**: 0.5 天

**子任务**:
- [ ] 安装 @nestjs/terminus
- [ ] 创建 HealthModule
- [ ] 创建 HealthController
- [ ] 添加数据库健康检查
- [ ] 添加 Redis 健康检查
- [ ] 实现 GET /health 接口
- [ ] 测试健康检查

**健康检查接口**:
```typescript
@Get('health')
async check() {
  return this.health.check([
    () => this.db.pingCheck('database'),
    () => this.redis.pingCheck('redis'),
  ]);
}
```

---

## 🔍 验证步骤

```bash
# 1. 启动 PostgreSQL 和 Redis
docker-compose up -d postgres redis

# 2. 运行 Migration
cd packages/server
pnpm prisma migrate dev

# 3. 启动服务
pnpm dev
# 预期：服务启动在 3000 端口

# 4. 测试健康检查
curl http://localhost:3000/health
# 预期：返回 {"status":"ok","info":{...}}

# 5. 测试上报接口
curl -X POST http://localhost:3000/api/v1/report \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key" \
  -d '{"appId":"test","sessionId":"sess_123","events":[],"meta":{}}'
# 预期：返回 204
```

---

## 📝 注意事项

1. **数据库选型**: 使用 PostgreSQL（而非 MySQL），支持 JSONB 和分区
2. **环境变量**: 敏感信息不提交到 Git
3. **错误处理**: 使用全局异常过滤器统一处理
4. **日志**: 使用结构化日志（JSON 格式）
5. **命名规范**: 文件名使用 kebab-case

---

## 🔗 相关文档

- [Server 设计文档](../docs/design/02-Server设计.md)
- [开发规范](../docs/development/rules.md)
