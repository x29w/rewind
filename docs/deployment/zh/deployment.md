# Rewind 部署指南

## 概述

本文档提供 Rewind 智能前端监控平台的完整部署指南，包括 Docker 部署和手动部署两种方式。

## 系统要求

### 硬件要求

- **CPU**: 2核心或以上
- **内存**: 4GB RAM 或以上（推荐 8GB）
- **存储**: 20GB 可用空间或以上

### 软件要求

- **操作系统**: Linux (Ubuntu 20.04+, CentOS 7+) / macOS / Windows
- **Node.js**: 18.x 或以上
- **pnpm**: 8.x 或以上
- **PostgreSQL**: 14+ (推荐 16+)
- **Redis**: 6.x 或以上
- **Docker**: 20.10+ (可选，用于容器化部署)
- **Docker Compose**: 2.0+ (可选)

## 方式一：Docker 部署（推荐）

### 1. 准备工作

克隆项目仓库：

```bash
git clone https://github.com/X29w/rewind.git
cd rewind
```

### 2. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，修改以下关键配置：

```env
# PostgreSQL 配置
POSTGRES_PASSWORD=your_secure_password_here

# JWT 密钥（生产环境必须修改）
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# OpenAI API Key（用于 AI 分析功能）
OPENAI_API_KEY=sk-your-openai-api-key-here

# 邮件配置（用于告警通知）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Rewind <noreply@rewind.dev>

# 生产环境设置
NODE_ENV=production
```

### 3. 启动服务

使用 Docker Compose 一键启动所有服务：

```bash
docker-compose up -d
```

服务启动后，可以通过以下地址访问：

- **Dashboard**: http://localhost
- **Server API**: http://localhost:3000
- **API 文档**: http://localhost:3000/api-docs

### 4. 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f server
docker-compose logs -f dashboard
```

### 5. 停止服务

```bash
docker-compose down
```

### 6. 数据持久化

Docker Compose 配置已包含数据卷，数据将持久化存储：

- PostgreSQL 数据: `postgres_data` 卷
- Redis 数据: `redis_data` 卷

## 方式二：手动部署

### 1. 安装依赖

```bash
# 安装 pnpm（如果尚未安装）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 2. 配置数据库

#### PostgreSQL

创建数据库：

```sql
CREATE DATABASE rewind;
CREATE USER rewind WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE rewind TO rewind;
```

#### Redis

确保 Redis 服务正在运行：

```bash
# Ubuntu/Debian
sudo systemctl start redis-server

# macOS
brew services start redis
```

### 3. 配置环境变量

在 `packages/server` 目录下创建 `.env` 文件：

```bash
cd packages/server
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
DATABASE_URL="postgresql://rewind:your_password@localhost:5432/rewind"

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key

# OpenAI 配置
OPENAI_API_KEY=sk-your-openai-api-key

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Rewind <noreply@rewind.dev>

# 服务端口
PORT=3000

# 环境
NODE_ENV=production
```

### 4. 数据库迁移

```bash
cd packages/server
pnpm prisma migrate deploy
```

### 5. 构建项目

```bash
# 返回项目根目录
cd ../..

# 构建所有包
pnpm build
```

### 6. 启动服务

#### 启动 Server

```bash
cd packages/server
pnpm start:prod
```

Server 将在 http://localhost:3000 启动。

#### 启动 Dashboard

Dashboard 是静态文件，需要使用 Web 服务器（如 Nginx）托管：

```bash
# 构建产物位于 packages/dashboard/dist
```

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/rewind/packages/dashboard/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 生产环境优化

### 1. 使用进程管理器

推荐使用 PM2 管理 Node.js 进程：

```bash
# 安装 PM2
npm install -g pm2

# 启动 Server
cd packages/server
pm2 start dist/main.js --name rewind-server

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

### 2. 配置反向代理

使用 Nginx 作为反向代理，提供 SSL 支持：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Dashboard
    location / {
        root /path/to/rewind/packages/dashboard/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. 数据库优化

#### PostgreSQL 配置优化

编辑 `postgresql.conf`：

```conf
# 连接配置
max_connections = 200

# 内存配置（根据服务器内存调整）
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
work_mem = 10MB

# 查询优化
random_page_cost = 1.1
effective_io_concurrency = 200

# 日志配置
log_min_duration_statement = 1000
```

#### 定期维护

```bash
# 定期执行 VACUUM
psql -U rewind -d rewind -c "VACUUM ANALYZE;"

# 设置定时任务
crontab -e
# 每天凌晨 2 点执行
0 2 * * * psql -U rewind -d rewind -c "VACUUM ANALYZE;"
```

### 4. 监控和日志

#### 应用监控

- 使用 PM2 监控进程状态
- 配置健康检查端点：`GET /health`

#### 日志管理

```bash
# PM2 日志
pm2 logs rewind-server

# 日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7
```

## 故障排查

### 常见问题

#### 1. 数据库连接失败

检查 DATABASE_URL 配置是否正确：

```bash
# 测试数据库连接
psql -U rewind -d rewind -h localhost
```

#### 2. Redis 连接失败

检查 Redis 是否运行：

```bash
redis-cli ping
# 应返回 PONG
```

#### 3. API 请求失败

检查 CORS 配置：

```typescript
// packages/server/src/main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(",") || "*",
  credentials: true,
});
```

#### 4. Docker 容器无法启动

查看容器日志：

```bash
docker-compose logs server
docker-compose logs postgres
```

## 安全建议

1. **修改默认密码**: 生产环境必须修改所有默认密码
2. **使用 HTTPS**: 配置 SSL 证书，强制使用 HTTPS
3. **限制数据库访问**: 配置防火墙，仅允许应用服务器访问数据库
4. **定期更新**: 及时更新依赖包和系统补丁
5. **备份数据**: 定期备份 PostgreSQL 数据库
6. **API 密钥管理**: 妥善保管 API Key 和 JWT Secret
7. **日志审计**: 启用访问日志和错误日志

## 性能调优

### 1. 数据库索引

项目已包含必要的数据库索引，确保执行迁移：

```bash
cd packages/server
pnpm prisma migrate deploy
```

### 2. 缓存策略

Server 已集成内存缓存，可根据需要调整缓存配置：

```typescript
// packages/server/src/cache/cache.service.ts
// 默认 TTL: 5 分钟
```

### 3. 连接池配置

调整 Prisma 连接池大小：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/rewind?connection_limit=20"
```

## 扩展部署

### 水平扩展

1. **Server 多实例**: 使用负载均衡器（如 Nginx）分发请求到多个 Server 实例
2. **数据库读写分离**: 配置 PostgreSQL 主从复制
3. **Redis 集群**: 使用 Redis Cluster 提高缓存性能

### 垂直扩展

1. 增加服务器 CPU 和内存
2. 使用 SSD 存储提升 I/O 性能
3. 优化数据库配置参数

## 备份和恢复

### 数据库备份

```bash
# 备份
pg_dump -U rewind -d rewind -F c -f rewind_backup_$(date +%Y%m%d).dump

# 恢复
pg_restore -U rewind -d rewind -c rewind_backup_20260505.dump
```

### Docker 卷备份

```bash
# 备份 PostgreSQL 数据卷
docker run --rm -v rewind_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres_backup.tar.gz /data

# 恢复
docker run --rm -v rewind_postgres_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/postgres_backup.tar.gz -C /
```

## 更新升级

### Docker 部署更新

```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose build

# 重启服务
docker-compose up -d
```

### 手动部署更新

```bash
# 拉取最新代码
git pull origin main

# 安装依赖
pnpm install

# 执行数据库迁移
cd packages/server
pnpm prisma migrate deploy

# 重新构建
cd ../..
pnpm build

# 重启服务
pm2 restart rewind-server
```

## 支持

如遇到问题，请：

1. 查看项目文档：`docs/` 目录
2. 提交 Issue：https://github.com/X29w/rewind/issues
3. 联系技术支持：support@rewind.dev

---

**最后更新**: 2026-05-05
