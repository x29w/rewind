# @rewind-dev/shared

Shared type definitions for the Rewind project.

## Overview

This package contains TypeScript type definitions shared across all Rewind packages:
- `@rewind-dev/sdk` - Frontend SDK
- `@rewind-dev/server` - Backend server
- `@rewind-dev/dashboard` - Dashboard application

## Type Categories

### Event Types (`types/event.ts`)
- `SDKEvent` - Base event interface
- `ErrorEvent` - JavaScript error events
- `BlankScreenEvent` - Blank screen detection events
- `APIErrorEvent` - API error events
- `PerformanceEvent` - Web Vitals performance metrics

### Breadcrumb Types (`types/breadcrumb.ts`)
- `Breadcrumb` - Base breadcrumb interface
- `ClickBreadcrumb` - User click events
- `NavigationBreadcrumb` - Page navigation events
- `HTTPBreadcrumb` - XHR/Fetch request events

### Device Types (`types/device.ts`)
- `DeviceInfo` - Browser and device information
- `NetworkInfo` - Network connection information

### Issue Types (`types/issue.ts`)
- `Issue` - Issue base interface
- `IssueEvent` - Individual issue event
- `IssueDetail` - Detailed issue information with AI analysis

## Usage

```typescript
import type { SDKEvent, Breadcrumb, Issue } from '@rewind-dev/shared';

const event: SDKEvent = {
  type: 'error',
  timestamp: Date.now(),
  data: { message: 'Something went wrong' }
};
```

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm type-check
```

## License

MIT
