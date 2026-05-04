# @rewind-dev/server

Backend server for Rewind monitoring platform.

## Features

- 🚀 **NestJS Framework** - Modular and scalable architecture
- 🗄️ **PostgreSQL + Prisma** - Type-safe database access
- 📮 **BullMQ** - Async job processing
- 🔄 **Redis** - Caching and session storage
- 🏥 **Health Checks** - Built-in health monitoring
- 🔒 **Validation** - Request validation with class-validator
- 📊 **Error Fingerprinting** - Smart error deduplication

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 16
- Redis >= 7

## Installation

```bash
pnpm install
```

## Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST` - Redis host
- `JWT_SECRET` - JWT secret key

## Database Setup

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Open Prisma Studio
pnpm prisma:studio
```

## Development

```bash
# Start development server
pnpm dev

# Build
pnpm build

# Start production server
pnpm start:prod
```

## API Endpoints

### Health Check
```
GET /health
```

### Event Ingestion
```
POST /api/v1/report
Headers:
  X-API-Key: <your-api-key>
Body: SDKEvent
```

## Architecture

```
src/
├── main.ts              # Application entry
├── app.module.ts        # Root module
├── health/              # Health check module
├── ingestion/           # Event ingestion module
├── processing/          # Event processing module
├── issue/               # Issue management module
└── common/              # Shared utilities
```

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov
```

## License

MIT
