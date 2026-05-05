# Rewind SDK API Reference

## Overview

This document provides detailed information about all public API methods, configuration options, and type definitions of the Rewind SDK.

## Table of Contents

- [Initialization Methods](#initialization-methods)
- [Client Methods](#client-methods)
- [Configuration Options](#configuration-options)
- [Type Definitions](#type-definitions)
- [Plugin System](#plugin-system)
- [Utility Functions](#utility-functions)

---

## Initialization Methods

### `init(options: SDK.InitOptions): SDK.Client`

Initialize the Rewind SDK and return a client instance.

**Parameters:**
- `options` - Initialization configuration options

**Returns:**
- `SDK.Client` - SDK client instance

**Example:**

```typescript
import { init } from '@rewind-dev/sdk';

const client = init({
  dsn: 'https://your-server.com/api/v1/report',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  environment: 'production'
});
```

### `getClient(): SDK.Client | null`

Get the current SDK client instance.

**Returns:**
- `SDK.Client | null` - Client instance, or null if not initialized

**Example:**

```typescript
import { getClient } from '@rewind-dev/sdk';

const client = getClient();
if (client) {
  client.captureError(new Error('Something went wrong'));
}
```

---

## Client Methods

### `captureError(error: Error, extra?: Record<string, any>): void`

Manually capture and report an error.

**Parameters:**
- `error` - Error object to capture
- `extra` - Optional additional information

**Example:**

```typescript
const client = getClient();

try {
  riskyOperation();
} catch (error) {
  client?.captureError(error, {
    extra: {
      userId: '123',
      action: 'checkout',
      step: 'payment'
    }
  });
}
```

### `addBreadcrumb(breadcrumb: Breadcrumb): void`

Add a breadcrumb record.

**Parameters:**
- `breadcrumb` - Breadcrumb object

**Example:**

```typescript
const client = getClient();

client?.addBreadcrumb({
  type: 'user',
  message: 'User clicked buy button',
  timestamp: Date.now(),
  level: 'info',
  category: 'ui',
  data: {
    buttonId: 'buy-now',
    productId: 'prod-123'
  }
});
```

### `sendEvent(event: SDKEvent): void`

Send a custom event.

**Parameters:**
- `event` - Event object

**Example:**

```typescript
const client = getClient();

client?.sendEvent({
  type: 'business',
  message: 'User completed purchase',
  timestamp: Date.now(),
  level: 'info',
  extra: {
    orderId: 'order-456',
    amount: 99.99,
    currency: 'USD'
  }
});
```

### `setUser(user: UserInfo): void`

Set user information.

**Parameters:**
- `user` - User information object

**Example:**

```typescript
const client = getClient();

client?.setUser({
  id: 'user-123',
  email: 'user@example.com',
  username: 'john_doe'
});
```

### `setTag(key: string, value: string): void`

Set a single tag.

**Parameters:**
- `key` - Tag key
- `value` - Tag value

**Example:**

```typescript
const client = getClient();

client?.setTag('feature', 'checkout');
client?.setTag('version', '2.1.0');
```

### `setTags(tags: Record<string, string>): void`

Set multiple tags at once.

**Parameters:**
- `tags` - Tags object

**Example:**

```typescript
const client = getClient();

client?.setTags({
  team: 'frontend',
  feature: 'checkout',
  version: '2.1.0'
});
```

### `setContext(key: string, context: any): void`

Set context information.

**Parameters:**
- `key` - Context key
- `context` - Context value

**Example:**

```typescript
const client = getClient();

client?.setContext('device', {
  model: 'iPhone 13',
  os: 'iOS 15.0'
});
```

### `clearBreadcrumbs(): void`

Clear all breadcrumb records.

**Example:**

```typescript
const client = getClient();
client?.clearBreadcrumbs();
```

### `registerPlugin(plugin: SDK.Plugin): void`

Register a plugin.

**Parameters:**
- `plugin` - Plugin instance

**Example:**

```typescript
import { getClient, ErrorPlugin } from '@rewind-dev/sdk';

const client = getClient();
client?.registerPlugin(new ErrorPlugin());
```

---

## Configuration Options

### `SDK.InitOptions`

SDK initialization configuration interface.

```typescript
interface InitOptions {
  // Required configuration
  dsn: string;                          // Data reporting URL
  appId: string;                        // Application ID
  appVersion: string;                   // Application version
  
  // Optional configuration
  environment?: string;                 // Environment identifier
  sampleRate?: number;                  // Sample rate (0-1)
  maxBreadcrumbs?: number;              // Maximum breadcrumbs count
  enabled?: boolean;                    // Whether enabled
  debug?: boolean;                      // Debug mode
  
  // User information
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
  
  // Tags
  tags?: Record<string, string>;
  
  // Plugin configuration
  enableBlankScreenDetection?: boolean; // Enable blank screen detection
  enableApiMonitoring?: boolean;        // Enable API monitoring
  
  // Transport configuration
  transport?: {
    batchSize?: number;                 // Batch size
    flushInterval?: number;             // Flush interval
    maxRetries?: number;                // Maximum retries
  };
  
  // Callback functions
  beforeSend?: (event: SDKEvent) => SDKEvent | null;
  onSuccess?: (event: SDKEvent) => void;
  onError?: (error: Error, event: SDKEvent) => void;
}
```

---

## Type Definitions

### `Breadcrumb`

Breadcrumb type definition.

```typescript
interface Breadcrumb {
  type: string;                         // Type
  message: string;                      // Message
  timestamp: number;                    // Timestamp
  level?: 'debug' | 'info' | 'warning' | 'error'; // Level
  category?: string;                    // Category
  data?: Record<string, any>;           // Data
}
```

### `SDKEvent`

SDK event type definition.

```typescript
interface SDKEvent {
  type: string;                         // Event type
  message: string;                      // Event message
  timestamp: number;                    // Timestamp
  level?: string;                       // Level
  stack?: string;                       // Stack trace
  filename?: string;                    // Filename
  lineno?: number;                      // Line number
  colno?: number;                       // Column number
  extra?: Record<string, any>;          // Extra information
  tags?: Record<string, string>;        // Tags
  breadcrumbs?: Breadcrumb[];           // Breadcrumbs
  deviceInfo?: DeviceInfo;              // Device information
}
```

---

## Plugin System

### Plugin Interface

```typescript
interface Plugin {
  name: string;                        // Plugin name
  setup: (client: Client) => void;     // Setup method
  teardown?: () => void;               // Cleanup method
}
```

### Built-in Plugins

#### ErrorPlugin

Automatically captures JavaScript errors.

```typescript
import { ErrorPlugin } from '@rewind-dev/sdk';

const errorPlugin = new ErrorPlugin({
  captureUnhandledRejections: true,    // Capture unhandled promise rejections
  captureConsoleErrors: true,          // Capture console.error
});
```

#### BehaviorPlugin

Records user behavior traces.

```typescript
import { BehaviorPlugin } from '@rewind-dev/sdk';

const behaviorPlugin = new BehaviorPlugin({
  captureClicks: true,                 // Capture click events
  captureNavigation: true,             // Capture navigation events
  captureFormSubmits: true,            // Capture form submissions
});
```

---

## Utility Functions

### Device Information Utils

#### `getDeviceInfo(): DeviceInfo`

Get device information.

```typescript
import { getDeviceInfo } from '@rewind-dev/sdk/utils';

const deviceInfo = getDeviceInfo();
console.log('Device info:', deviceInfo);
```

### DOM Utils

#### `getElementPath(params: { element: HTMLElement }): string`

Get element path.

```typescript
import { getElementPath } from '@rewind-dev/sdk/utils';

const button = document.querySelector('#buy-button');
const path = getElementPath({ element: button });
console.log('Element path:', path); // Output: button#buy-button.btn.btn-primary
```

---

## Best Practices

### 1. Initialization Timing

```typescript
// ✅ Good: Initialize early in app startup
// index.js or main.js
import { init } from '@rewind-dev/sdk';

init({
  dsn: process.env.REWIND_DSN,
  appId: process.env.REWIND_APP_ID,
  appVersion: process.env.APP_VERSION
});

// Then start the app
import('./app').then(({ startApp }) => {
  startApp();
});
```

### 2. Error Boundary Integration

```typescript
// React Error Boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    const client = getClient();
    client?.captureError(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });
  }
}
```

### 3. Sensitive Information Filtering

```typescript
init({
  dsn: 'your-dsn',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  
  beforeSend: (event) => {
    // Filter sensitive information
    const sensitiveKeys = ['password', 'token', 'creditCard', 'ssn'];
    
    if (event.extra) {
      sensitiveKeys.forEach(key => {
        if (event.extra[key]) {
          event.extra[key] = '[Filtered]';
        }
      });
    }
    
    return event;
  }
});
```

---

**Last Updated**: May 5, 2026
**Document Version**: v1.0