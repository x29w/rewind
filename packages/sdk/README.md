# @rewind-dev/sdk

Frontend monitoring SDK for Rewind platform.

## Features

- 🎯 **Error Tracking** - Automatic JavaScript error capture
- 🍞 **Breadcrumbs** - User action recording
- 👻 **Blank Screen Detection** - FCP timeout + DOM sampling
- 📊 **Performance Monitoring** - Web Vitals collection
- 🔌 **Plugin System** - Extensible architecture
- 📦 **Zero Dependencies** - No runtime dependencies
- 🪶 **Lightweight** - < 15KB gzipped

## Installation

```bash
npm install @rewind-dev/sdk
# or
pnpm add @rewind-dev/sdk
```

## Quick Start

```typescript
import { init } from '@rewind-dev/sdk';

init({
  dsn: 'https://your-server.com/api/v1/report',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  environment: 'production',
  sampleRate: 1.0,
  maxBreadcrumbs: 100,
  debug: false
});
```

## Manual Error Capture

```typescript
import { captureError } from '@rewind-dev/sdk';

try {
  // Your code
} catch (error) {
  captureError(error, {
    extra: {
      userId: '123',
      action: 'checkout'
    }
  });
}
```

## Manual Breadcrumb

```typescript
import { addBreadcrumb } from '@rewind-dev/sdk';

addBreadcrumb({
  type: 'click',
  level: 'info',
  message: 'User clicked checkout button',
  timestamp: Date.now(),
  data: {
    buttonId: 'checkout-btn'
  }
});
```

## Configuration

### Required Options

- `dsn` - Server endpoint URL
- `appId` - Your application ID
- `appVersion` - Application version

### Optional Options

- `environment` - Environment name (default: 'production')
- `sampleRate` - Sample rate 0-1 (default: 1.0)
- `maxBreadcrumbs` - Max breadcrumb count (default: 100)
- `enabled` - Enable/disable SDK (default: true)
- `debug` - Debug mode (default: false)
- `user` - User information
- `tags` - Custom tags
- `plugins` - Plugin configurations

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Run tests
pnpm test

# Test coverage
pnpm test:coverage

# Type check
pnpm type-check
```

## Architecture

```
src/
├── core/           # Core engine
│   ├── client.ts   # Main client
│   └── types/      # Type definitions
├── plugins/        # Feature plugins
├── utils/          # Utility functions
└── index.ts        # Public API
```

## License

MIT
