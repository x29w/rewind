# @rewind-dev/server — 后端服务设计文档

> 基于 PRD v3.0 | 日期：2026-04-29

---

## 一、应用概述

| 属性 | 说明 |
|------|------|
| 包名 | `@rewind-dev/server` |
| 技术栈 | NestJS 11 + Prisma 6 + PostgreSQL 16 + Redis 7 + BullMQ 5 |
| 运行方式 | Node.js 进程 / Docker 容器 |
| 端口 | 3000（可配置） |
| 职责 | 数据接收、处理管线、Issue 管理、AI 分析、告警引擎、性能聚合 |

---

## 二、目录结构

```
packages/server/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   │
│   ├── config/
│   │   ├── config.module.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── ai.config.ts
│   │
│   ├── common/
│   │   ├── guards/
│   │   │   ├── api-key.guard.ts         # SDK 上报认证
│   │   │   └── jwt-auth.guard.ts        # Dashboard 认证
│   │   ├── filters/
│   │   │   └── global-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── response-transform.interceptor.ts
│   │   └── decorators/
│   │       └── current-project.decorator.ts
│   │
│   └── modules/
│       ├── ingestion/       # 数据接收
│       ├── processing/      # 数据处理管线
│       ├── issue/           # Issue 管理
│       ├── event/           # 事件查询
│       ├── sourcemap/       # SourceMap 管理
│       ├── performance/     # 性能分析
│       ├── alert/           # 告警引擎
│       ├── ai/              # AI 分析（可插拔）
│       ├── project/         # 项目管理
│       └── auth/            # 认证
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── test/
├── Dockerfile
├── tsconfig.json
└── package.json
```

---

## 三、模块设计

### 3.1 模块依赖关系

```
AppModule
├── ConfigModule (全局)
├── PrismaModule (全局)
├── RedisModule (全局)
├── BullModule (全局，注册队列)
│
├── AuthModule              # 无依赖
├── ProjectModule           # 依赖 AuthModule
├── IngestionModule         # 依赖 RedisModule, BullModule
├── ProcessingModule        # 依赖 SourcemapModule, IssueModule, AlertModule, AIModule
├── IssueModule             # 依赖 PrismaModule
├── EventModule             # 依赖 PrismaModule
├── SourcemapModule         # 依赖 PrismaModule
├── PerformanceModule       # 依赖 PrismaModule
├── AlertModule             # 依赖 RedisModule, PrismaModule
└── AIModule (可选)         # 依赖 PrismaModule, BullModule, ConfigModule
```

### 3.2 各模块详细设计

#### IngestionModule — 数据接收

```
ingestion/
├── ingestion.module.ts
├── ingestion.controller.ts    # POST /api/v1/report
├── ingestion.service.ts       # 校验 → 入队列
├── rate-limiter.service.ts    # Redis 滑动窗口限流
└── dto/
    └── report.dto.ts          # class-validator 校验规则
```

**Controller**：

```typescript
@Controller('api/v1')
export class IngestionController {
  @Post('report')
  @UseGuards(ApiKeyGuard)
  @HttpCode(204)
  async report(@Body() dto: ReportDto, @CurrentProject() project: Project) {
    await this.ingestionService.process(dto, project);
    // 立即返回 204，不等待处理完成
  }
}
```

**限流**：Redis 滑动窗口，key = `rate:{appId}`，窗口 60s，上限 1000 次

```typescript
@Injectable()
export class RateLimiterService {
  async check(appId: string): Promise<boolean> {
    const key = `rate:${appId}`;
    const now = Date.now();
    const pipe = this.redis.pipeline();
    pipe.zremrangebyscore(key, 0, now - 60000);
    pipe.zadd(key, now, `${now}:${Math.random()}`);
    pipe.zcard(key);
    pipe.expire(key, 60);
    const results = await pipe.exec();
    return (results[2][1] as number) <= 1000;
  }
}
```

**DTO 校验**：

```typescript
export class ReportDto {
  @IsString()
  appId: string;

  @IsString()
  sessionId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventDto)
  events: EventDto[];

  @ValidateNested()
  @Type(() => MetaDto)
  meta: MetaDto;
}
```

---

#### ProcessingModule — 数据处理管线

```
processing/
├── processing.module.ts
├── processing.processor.ts    # BullMQ Worker（队列消费者）
├── normalizer.service.ts      # 字段标准化
├── fingerprint.service.ts     # 指纹计算
└── pipeline.service.ts        # 管线编排
```

**管线流程**：

```
原始事件 → ① normalize → ② resolveStack → ③ computeFingerprint
  → ④ upsertIssue → ⑤ saveEvent → ⑥ updateAggregation → ⑦ checkAlerts
```

```typescript
@Processor('event-processing')
export class ProcessingProcessor extends WorkerHost {
  async process(job: Job<{ events: RawEvent[]; meta: ReportMeta; projectId: string }>) {
    const { events, meta, projectId } = job.data;

    for (const raw of events) {
      // ① 标准化
      const event = this.normalizer.normalize(raw, meta, projectId);

      // ② SourceMap 还原（仅错误类事件）
      if (this.isErrorType(event.type) && event.data.stack) {
        event.data.resolvedStack = await this.stackResolver.resolve(
          event.data.stack, meta.appVersion, projectId,
        );
      }

      // ③ 指纹 + ④ Issue 归并
      if (this.isErrorType(event.type)) {
        const fingerprint = this.fingerprint.compute(event);
        const issue = await this.issueService.upsertByFingerprint(projectId, fingerprint, event);
        event.issueId = issue.id;
      }

      // ⑤ 存储
      await this.eventService.create(event);

      // ⑥ 性能聚合
      if (event.type === 'performance') {
        await this.perfAggService.update(event);
      }

      // ⑦ 告警检测
      await this.alertDetector.check(event);
    }
  }

  private isErrorType(type: string): boolean {
    return ['error', 'blank_screen', 'api_error'].includes(type);
  }
}
```

**指纹算法**：

```typescript
@Injectable()
export class FingerprintService {
  compute(event: NormalizedEvent): string {
    const parts: string[] = [];

    if (event.type === 'api_error') {
      parts.push('api_error', event.data.method, this.normalizeUrl(event.data.url), String(event.data.status));
    } else {
      parts.push(
        event.data.subType || event.type,
        this.normalizeMessage(event.data.message),
        this.topFrames(event.data.resolvedStack || event.data.stack, 3),
      );
    }

    return createHash('md5').update(parts.join('||')).digest('hex');
  }

  private normalizeMessage(msg: string): string {
    return msg
      .replace(/\b\d+\b/g, '{N}')
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '{UUID}')
      .replace(/\/\d+/g, '/{param}');
  }

  private topFrames(stack: string, n: number): string {
    if (!stack) return '';
    return stack.split('\n')
      .filter(l => l.includes('at '))
      .slice(0, n)
      .map(l => l.replace(/:\d+:\d+/g, ''))
      .join('|');
  }

  private normalizeUrl(url: string): string {
    try {
      return new URL(url).pathname.replace(/\/\d+/g, '/{id}');
    } catch { return url; }
  }
}
```

---

#### IssueModule — Issue 管理

```
issue/
├── issue.module.ts
├── issue.controller.ts
├── issue.service.ts
└── dto/
    ├── query-issues.dto.ts
    └── update-status.dto.ts
```

**核心接口**：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/projects/:pid/issues` | 列表（分页+筛选+排序） |
| GET | `/api/v1/issues/:id` | 详情（含 AI 摘要） |
| PATCH | `/api/v1/issues/:id/status` | 更新状态 |
| GET | `/api/v1/issues/:id/trend` | 趋势数据 |
| GET | `/api/v1/issues/:id/distribution` | 环境分布 |
| GET | `/api/v1/issues/:id/compare-events` | 多事件对比 |

**Issue 归并（upsertByFingerprint）**：

```typescript
async upsertByFingerprint(projectId: string, fingerprint: string, event: NormalizedEvent) {
  return this.prisma.$transaction(async (tx) => {
    let issue = await tx.issue.findUnique({
      where: { projectId_fingerprint: { projectId, fingerprint } },
    });

    if (!issue) {
      issue = await tx.issue.create({ data: { projectId, fingerprint, type: event.data.subType || event.type, message: event.data.message, status: 'open', firstSeen: new Date(event.timestamp), lastSeen: new Date(event.timestamp), eventCount: 1, userCount: event.userId ? 1 : 0 } });
      // 异步触发 AI 摘要
      await this.aiQueue.add('summary', { issueId: issue.id });
    } else {
      const update: any = { lastSeen: new Date(event.timestamp), eventCount: { increment: 1 } };
      if (issue.status === 'resolved') {
        update.status = 'regressed';
        await this.alertQueue.add('issue-regressed', { issueId: issue.id });
      }
      issue = await tx.issue.update({ where: { id: issue.id }, data: update });
    }

    return issue;
  });
}
```

**环境分布接口**：

```typescript
async getDistribution(issueId: string) {
  const events = await this.prisma.event.findMany({
    where: { issueId },
    select: { device: true, appVersion: true },
  });

  return {
    browsers: this.countBy(events, e => (e.device as any).browser),
    os: this.countBy(events, e => (e.device as any).os),
    versions: this.countBy(events, e => e.appVersion),
  };
}
```

---

#### EventModule — 事件查询

```
event/
├── event.module.ts
├── event.controller.ts
└── event.service.ts
```

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/issues/:id/events` | 事件列表（分页） |
| GET | `/api/v1/issues/:id/events/:eid` | 单事件详情（含完整 breadcrumbs） |
| GET | `/api/v1/issues/:id/compare-events?ids=a,b,c` | 多事件对比数据 |
| GET | `/api/v1/sessions/:sid/timeline` | 会话时间线 |

---

#### SourcemapModule — SourceMap 管理

```
sourcemap/
├── sourcemap.module.ts
├── sourcemap.controller.ts     # POST /api/v1/sourcemap（文件上传）
├── sourcemap.service.ts        # 存储管理 + 版本清理
└── stack-resolver.service.ts   # 堆栈还原（source-map 库 + LRU 缓存）
```

**堆栈还原**：
- 输入：压缩后的堆栈字符串 + appVersion
- 匹配 SourceMap 文件 → `source-map` 库解析 → 还原为源文件名+行号+源码片段
- LRU 缓存（1000 条），相同堆栈不重复解析

---

#### AlertModule — 告警引擎

```
alert/
├── alert.module.ts
├── alert.controller.ts         # 规则 CRUD + 历史查询
├── alert.service.ts            # 规则管理
├── detector.service.ts         # 告警检测（@Cron 定时扫描）
├── anomaly.service.ts          # 异常检测（同比统计）
└── notifier/
    ├── notifier.interface.ts   # 通知渠道抽象
    ├── webhook.notifier.ts     # Webhook（飞书/钉钉/Slack）
    └── email.notifier.ts       # 邮件（nodemailer）
```

**检测流程**（每分钟执行）：

```typescript
@Cron('* * * * *')
async detect() {
  const rules = await this.alertService.getEnabledRules();

  for (const rule of rules) {
    // 静默期检查
    if (rule.lastTriggered && Date.now() - rule.lastTriggered.getTime() < rule.silencePeriod * 1000) continue;

    // 计算当前指标值
    const value = await this.computeMetric(rule.metric, rule.filters, rule.condition.window);

    // 阈值判定
    if (this.evaluate(value, rule.condition)) {
      await this.trigger(rule, value);
    }
  }
}
```

**异常检测**（同比统计）：

```typescript
async detectAnomaly(projectId: string, metric: string) {
  const current = await this.getMetricValue(projectId, metric, '1h');
  const historical = await this.getHistoricalAvg(projectId, metric, '1h', 4); // 过去 4 周同时段
  const stddev = await this.getHistoricalStddev(projectId, metric, '1h', 4);

  if (stddev > 0 && Math.abs(current - historical) > 3 * stddev) {
    return { isAnomaly: true, current, historical, deviation: (current - historical) / stddev };
  }
  return { isAnomaly: false };
}
```

---

#### AIModule — AI 分析（可插拔）

```
ai/
├── ai.module.ts
├── ai.controller.ts
├── ai.service.ts               # 分析编排 + Provider 调度
├── context-builder.service.ts  # 上下文自动构建
├── prompt-manager.service.ts   # Prompt 模板管理
├── daily-report.service.ts     # 日报定时任务
└── providers/
    ├── llm-provider.interface.ts
    ├── gemini.provider.ts      # Google Gemini 2.5 Flash
    └── groq.provider.ts        # Groq Llama 3.3 70B
```

**可插拔设计**：

```typescript
// ai.module.ts
@Module({
  imports: [
    BullModule.registerQueue({ name: 'ai-analysis' }),
  ],
  // ...
})
export class AIModule {
  // 通过环境变量控制是否注册
  static register(): DynamicModule {
    const enabled = process.env.AI_ENABLED !== 'false';
    if (!enabled) {
      return { module: AIModule, providers: [], exports: [] };
    }
    return {
      module: AIModule,
      providers: [AIService, GeminiProvider, GroqProvider, ContextBuilderService, PromptManagerService],
      controllers: [AIController],
      exports: [AIService],
    };
  }
}
```

**Provider 主备切换**：Gemini 优先 → 失败/额度用完 → 自动切换 Groq → 都不可用 → 返回 503

**成本控制**：
- 结果按 issueId + type 缓存（Redis，TTL 24h）
- 每日调用计数器（Redis，`ai:daily:{date}`），超限返回 429
- 默认上限 50 次/天，可通过环境变量配置

---

## 四、数据库 Schema

完整 Prisma Schema 见 `00-总体架构.md` 中的共享类型定义。

核心表：`projects` / `issues` / `events`（按月分区）/ `ai_analyses` / `alert_rules` / `alert_history` / `sourcemaps` / `performance_aggregations` / `users`

**分区策略**：events 表按月 Range 分区，通过定时任务自动创建未来分区。

**数据保留**：定时任务每天凌晨清理超过 `DATA_RETENTION_DAYS`（默认 90 天）的事件数据。

---

## 五、Server 任务清单

| 编号 | 任务 | 预估 | 阶段 |
|------|------|------|------|
| SVR-01 | NestJS 项目初始化 + 全局配置（Config/Prisma/Redis/Bull） | 1d | P0-a |
| SVR-02 | Prisma Schema + Migration（projects/events 表） | 1d | P0-a |
| SVR-03 | IngestionModule：上报接口 + DTO 校验 + 限流 | 1.5d | P0-a |
| SVR-04 | ProcessingModule：BullMQ Worker + 批量消费 | 1d | P0-a |
| SVR-05 | Normalizer：字段标准化 + UA 解析 | 0.5d | P0-a |
| SVR-06 | AuthModule：JWT 登录 + ApiKeyGuard | 1d | P0-a |
| SVR-07 | Prisma Schema 补充（issues/ai_analyses 表） | 0.5d | P0-b |
| SVR-08 | FingerprintService：指纹算法 + message 标准化 | 1.5d | P0-b |
| SVR-09 | IssueService：归并逻辑 + 状态机 | 1.5d | P0-b |
| SVR-10 | Pipeline 整合（标准化→指纹→归并→存储） | 1d | P0-b |
| SVR-11 | SourcemapModule：上传接口 + 存储管理 | 1d | P0-b |
| SVR-12 | StackResolver：堆栈还原 + LRU 缓存 | 2d | P0-b |
| SVR-13 | IssueController：列表/详情/状态/趋势/分布 API | 2d | P0-b |
| SVR-14 | EventController：事件详情 + 对比 API | 1.5d | P0-b |
| SVR-15 | 白屏/接口异常事件处理适配 | 1d | P0-c |
| SVR-16 | LLM Provider 抽象 + Gemini 实现 + Groq 实现 | 1.5d | P1 |
| SVR-17 | ContextBuilder + PromptManager | 1.5d | P1 |
| SVR-18 | AI 分析队列 + 缓存 + 成本控制 | 1d | P1 |
| SVR-19 | AI 摘要（自动）+ 上下文分析（手动）接口 | 1.5d | P1 |
| SVR-20 | DailyReport 定时任务 | 1d | P1 |
| SVR-21 | AlertRule CRUD + Schema | 1d | P1 |
| SVR-22 | Detector 定时扫描 + 阈值判定 | 1.5d | P1 |
| SVR-23 | AnomalyService 同比统计检测 | 1d | P1 |
| SVR-24 | Notifier：Webhook + Email | 1.5d | P1 |
| SVR-25 | Issue 回归自动告警 | 0.5d | P1 |
| SVR-26 | PerformanceModule：聚合任务 + 查询 API | 2d | P2 |
| SVR-27 | ProjectModule：CRUD + 设置 | 1d | P2 |
| SVR-28 | 数据保留定时任务 + 分区管理 | 1d | P2 |
| SVR-29 | Dockerfile + 健康检查接口 | 0.5d | P2 |
