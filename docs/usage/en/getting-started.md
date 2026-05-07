# Rewind Usage Guide

## Overview

Rewind is an intelligent frontend monitoring platform consisting of three core components:

1. **SDK** - Frontend data collection library, integrated into your applications
2. **Server** - Backend service for data processing, storage, analysis, and AI features
3. **Dashboard** - Visualization platform for viewing and managing monitoring data

## Overall Implementation Flow

```
User App → SDK Collection → Server Processing → Dashboard Display
    ↓           ↓              ↓                ↓
  Integrate SDK  Auto Report   Smart Analysis   Issue Location
```

### Detailed Process

1. **Data Collection Phase**
   - SDK automatically captures errors, user behaviors, performance data
   - Real-time recording of breadcrumb trails (clicks, navigation, API calls, etc.)
   - Detection of blank screens, API anomalies, and other special scenarios

2. **Data Processing Phase**
   - Server receives data reported by SDK
   - Uses fingerprint algorithm to automatically aggregate similar issues
   - AI analyzes error causes and provides fix suggestions
   - Triggers intelligent alert rules

3. **Issue Location Phase**
   - Dashboard displays issue lists and details
   - Provides complete user operation trace replay
   - Shows error stacks, environment info, AI analysis results
   - Supports issue status management and team collaboration

---

## I. Quick Start

### 1.1 Deploy Rewind Platform

#### Using Docker (Recommended)

```bash
# 1. Clone project
git clone https://github.com/X29w/rewind.git
cd rewind

# 2. Configure environment variables
cp .env.example .env
# Edit .env file, set database password, JWT secret, etc.

# 3. Start all services
docker-compose up -d

# 4. Access Dashboard
# http://localhost - Dashboard interface
# http://localhost:3000 - Server API
# http://localhost:3000/api-docs - API documentation
```

For detailed deployment instructions, see: [Deployment Guide](../deployment/en/deployment.md)

### 1.2 Create Project

1. Visit Dashboard: http://localhost
2. Register account and login
3. Create new project, get **App ID** and **API Key**

---

## II. SDK Integration Usage

### 2.1 Install SDK

```bash
# npm
npm install @rewind-dev/sdk

# pnpm
pnpm add @rewind-dev/sdk

# yarn
yarn add @rewind-dev/sdk
```

### 2.2 Basic Integration

#### 2.2.1 Minimal Integration

```typescript
import { init } from "@rewind-dev/sdk";

// Initialize when app starts
init({
  dsn: "http://localhost:3000/api/v1/report", // Server address
  appId: "your-app-id", // Get from Dashboard
  appVersion: "1.0.0", // App version
  environment: "production", // Environment identifier
});
```

#### 2.2.2 Complete Configuration

```typescript
import { init } from "@rewind-dev/sdk";

const client = init({
  // Required configuration
  dsn: "http://localhost:3000/api/v1/report",
  appId: "your-app-id",
  appVersion: "1.0.0",

  // Optional configuration
  environment: "production", // Environment: development, staging, production
  sampleRate: 1.0, // Sample rate: 0.0-1.0, 1.0 means 100% sampling
  maxBreadcrumbs: 100, // Maximum breadcrumbs count
  enabled: true, // Whether to enable SDK
  debug: false, // Debug mode

  // User information
  user: {
    id: "user-123",
    email: "user@example.com",
    username: "john_doe",
  },

  // Custom tags
  tags: {
    team: "frontend",
    feature: "checkout",
  },

  // Plugin configuration
  enableBlankScreenDetection: true, // Enable blank screen detection
  enableApiMonitoring: true, // Enable API monitoring
});
```

### 2.3 Manual Reporting

#### 2.3.1 Capture Errors

```typescript
import { getClient } from "@rewind-dev/sdk";

const client = getClient();

try {
  // Potentially error-prone code
  riskyOperation();
} catch (error) {
  // Manually report error
  client?.captureError(error, {
    extra: {
      userId: "123",
      action: "checkout",
      step: "payment",
    },
  });
}
```

#### 2.3.2 Add Breadcrumbs

```typescript
import { getClient } from "@rewind-dev/sdk";

const client = getClient();

// Add custom breadcrumb
client?.addBreadcrumb({
  type: "user",
  message: "User clicked buy button",
  timestamp: Date.now(),
  level: "info",
  category: "ui",
  data: {
    buttonId: "buy-now",
    productId: "prod-123",
  },
});
```

#### 2.3.3 Send Custom Events

```typescript
import { getClient } from "@rewind-dev/sdk";

const client = getClient();

// Send business event
client?.sendEvent({
  type: "business",
  message: "User completed purchase",
  timestamp: Date.now(),
  level: "info",
  extra: {
    orderId: "order-456",
    amount: 99.99,
    currency: "USD",
  },
});
```

### 2.4 Framework Integration Examples

#### 2.4.1 React Integration

```typescript
// src/utils/monitoring.ts
import { init } from '@rewind-dev/sdk';

export const initMonitoring = () => {
  return init({
    dsn: process.env.REACT_APP_REWIND_DSN!,
    appId: process.env.REACT_APP_REWIND_APP_ID!,
    appVersion: process.env.REACT_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV,
    user: {
      id: localStorage.getItem('userId') || undefined,
    }
  });
};

// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initMonitoring } from './utils/monitoring';

// Initialize monitoring
initMonitoring();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
```

#### 2.4.2 Vue Integration

```typescript
// src/plugins/monitoring.ts
import { init } from "@rewind-dev/sdk";
import type { App } from "vue";

export default {
  install(app: App) {
    const client = init({
      dsn: import.meta.env.VITE_REWIND_DSN,
      appId: import.meta.env.VITE_REWIND_APP_ID,
      appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
      environment: import.meta.env.MODE,
    });

    // Global error handling
    app.config.errorHandler = (error, instance, info) => {
      client?.captureError(error as Error, {
        extra: { info, component: instance?.$options.name },
      });
    };

    app.provide("rewindClient", client);
  },
};

// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";
import monitoring from "./plugins/monitoring";

const app = createApp(App);
app.use(monitoring);
app.mount("#app");
```

---

## III. Dashboard Usage

### 3.1 Project Management

#### 3.1.1 Create Project

1. Login to Dashboard
2. Click "New Project"
3. Fill project information:
   - Project name
   - Project description
   - Team members
4. Get App ID and API Key

#### 3.1.2 Project Configuration

- **Basic Settings**: Project name, description, team members
- **Alert Rules**: Error count thresholds, notification channels
- **Data Retention**: Historical data retention period
- **API Keys**: Manage SDK access keys

### 3.2 Issue Management

#### 3.2.1 Issue List

- **Filter Function**: Filter by status, level, time range
- **Search Function**: Search by error message, filename
- **Sort Function**: Sort by occurrence time, affected users
- **Batch Operations**: Batch mark resolved, ignore

#### 3.2.2 Issue Details

**Basic Information**

- Error message and stack information
- Occurrence time and affected user count
- Error level and status

**User Trace**

- Complete user operation timeline
- Click, navigation, API call records
- Key operations before error occurrence

**Environment Information**

- Browser, operating system information
- Screen resolution, device type
- Network status, page URL

**AI Analysis**

- Error root cause analysis
- Possible fix suggestions
- Similar issue recommendations

---

## IV. Server API Usage

### 4.1 Authentication

All API requests need to include API Key in Header:

```http
POST /api/v1/report
Content-Type: application/json
X-API-Key: your-api-key

{
  "event": { ... }
}
```

### 4.2 Event Reporting API

#### 4.2.1 Single Event Report

```http
POST /api/v1/report
Content-Type: application/json
X-API-Key: your-api-key

{
  "event": {
    "type": "error",
    "message": "TypeError: Cannot read property 'name' of undefined",
    "timestamp": 1683360000000,
    "stack": "TypeError: Cannot read property...",
    "filename": "https://example.com/app.js",
    "lineno": 42,
    "colno": 15,
    "extra": {
      "userId": "user-123",
      "action": "checkout"
    },
    "tags": {
      "environment": "production",
      "version": "1.0.0"
    },
    "breadcrumbs": [...],
    "deviceInfo": {...}
  }
}
```

#### 4.2.2 Batch Event Report

```http
POST /api/v1/report/batch
Content-Type: application/json
X-API-Key: your-api-key

{
  "events": [
    { "type": "error", ... },
    { "type": "behavior", ... },
    { "type": "performance", ... }
  ]
}
```

---

## V. Best Practices

### 5.1 SDK Integration Best Practices

#### 5.1.1 Error Boundaries

```typescript
// React Error Boundary Example
import React from "react";
import { getClient } from "@rewind-dev/sdk";

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const client = getClient();
    client?.captureError(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    });
  }

  render() {
    // Error UI rendering logic
  }
}
```

#### 5.1.2 Async Error Capture

```typescript
// Promise error capture
window.addEventListener("unhandledrejection", (event) => {
  const client = getClient();
  client?.captureError(new Error(event.reason), {
    extra: {
      type: "unhandledrejection",
      promise: true,
    },
  });
});
```

### 5.2 Performance Optimization

#### 5.2.1 Sampling Strategy

```typescript
// Set sample rate based on environment and user type
const getSampleRate = () => {
  if (process.env.NODE_ENV === "development") {
    return 1.0; // 100% sampling in development
  }

  const userType = getUserType();
  switch (userType) {
    case "internal":
      return 1.0; // Internal users 100%
    case "beta":
      return 0.5; // Beta users 50%
    case "premium":
      return 0.2; // Premium users 20%
    default:
      return 0.05; // Regular users 5%
  }
};

init({
  dsn: "your-dsn",
  appId: "your-app-id",
  appVersion: "1.0.0",
  sampleRate: getSampleRate(),
});
```

---

## VI. FAQ

### Q1: Will SDK affect application performance?

**A:** SDK is carefully optimized with minimal impact on application performance:

- Core package < 15KB gzipped
- Async reporting, doesn't block main thread
- Smart sampling reduces network requests
- Built-in error handling won't crash applications

### Q2: How to handle sensitive data?

**A:** Multiple ways to protect sensitive data:

- Use `beforeSend` callback to filter sensitive fields
- Configure sample rate to reduce data collection
- Set data retention period, regular cleanup
- Support on-premise deployment, data stays internal

### Q3: Which browsers are supported?

**A:** SDK supports all modern browsers:

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers

---

## VII. Technical Support

### 7.1 Documentation Resources

- **API Documentation**: http://localhost:3000/api-docs
- **Deployment Guide**: [docs/deployment/](../deployment/)
- **Development Standards**: [docs/development/](../development/)
- **Design Documents**: [docs/design/](../design/)

### 7.2 Community Support

- **GitHub Issues**: https://github.com/X29w/rewind/issues
- **Discussions**: https://github.com/X29w/rewind/discussions
- **Changelog**: https://github.com/X29w/rewind/releases

### 7.3 Commercial Support

- **Technical Consulting**: support@rewind.dev
- **Custom Development**: enterprise@rewind.dev
- **Training Services**: training@rewind.dev

---

**Last Updated**: May 5, 2026
**Document Version**: v1.0
