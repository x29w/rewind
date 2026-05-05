# Rewind — Intelligent Frontend Monitoring & Issue Localization Platform

<div align="center">

**Make Every Error Traceable**

[![English](https://img.shields.io/badge/lang-English-blue.svg)](./README.md)
[![简体中文](https://img.shields.io/badge/lang-简体中文-red.svg)](./README.zh-CN.md)
[![繁體中文](https://img.shields.io/badge/lang-繁體中文-orange.svg)](./README.zh-TW.md)
[![日本語](https://img.shields.io/badge/lang-日本語-green.svg)](./README.ja.md)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRD](https://img.shields.io/badge/PRD-v3.0-green.svg)](docs/PRD/PRD.md)
[![Status](https://img.shields.io/badge/status-in%20development-yellow.svg)]()

</div>

---

## 📖 Introduction

Rewind is an intelligent monitoring and issue localization platform for frontend developers, designed to solve the pain points of **"can't reproduce, can't locate"** production issues.

### Core Features

- 🎯 **Session Recording & Replay** - Automatically record user interaction traces, fully restore "how the error happened" when errors occur
- 🔍 **Issue Localization Workbench** - Source-level stack traces + operation timeline + environment diff analysis + AI context summary
- 🧠 **AI-Enhanced Analysis** - Automatically organize error context, provide possible causes and fix directions
- 🎨 **Intelligent Grouping & Deduplication** - Error fingerprint algorithm automatically groups similar issues with >95% accuracy
- 👻 **Blank Screen Detection** - FCP timeout + DOM sampling dual detection, automatically correlate operation traces
- 📊 **Performance Monitoring** - Web Vitals collection and analysis
- 🚨 **Smart Alerting** - Automatic notifications for error spikes and issue regressions

### Difference from Traditional Monitoring

```
Traditional: Error occurs → See error → Manual investigation → Try to reproduce → Guess cause → Fix
                                        ↑ Most time-consuming and painful step

Rewind:      Error occurs → Auto-group → Restore trace → AI organize clues → Locate & fix
                                        ↑ Core value: Make every error traceable
```

---

## 🏗️ System Architecture

Rewind adopts a **Monorepo** architecture, consisting of 3 core applications:

```
rewind/
├── packages/
│   ├── shared/          # Shared type definitions
│   ├── sdk/             # Frontend collection SDK (TypeScript + Rollup)
│   ├── server/          # Backend service (NestJS + PostgreSQL + Redis)
│   └── dashboard/       # Visualization platform (React + Vite + Ant Design)
├── docs/                # Project documentation
├── scripts/             # Utility scripts
└── .kiro/               # Kiro Agent configuration
```

### Tech Stack

| Application | Tech Stack | Description |
|-------------|------------|-------------|
| **SDK** | TypeScript + Rollup | Zero dependencies, gzip < 15KB |
| **Server** | NestJS + Prisma + PostgreSQL + Redis + BullMQ | Modular architecture, supports horizontal scaling |
| **Dashboard** | React 18 + Vite + Ant Design 5 + Redux Toolkit + TanStack Router | Type-safe routing, high-performance rendering |

---

## 🚀 Quick Start

### Requirements

- Node.js >= 18
- pnpm >= 9
- PostgreSQL >= 16
- Redis >= 7

### Installation

```bash
# Clone the project
git clone https://github.com/your-org/rewind.git
cd rewind

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Development Mode

```bash
# Start Server
pnpm dev:server

# Start Dashboard
pnpm dev:dashboard

# Build SDK
pnpm build:sdk
```

### Using the SDK

```bash
# Install
npm install @rewind-dev/sdk

# Or
pnpm add @rewind-dev/sdk
```

```typescript
import { init } from '@rewind-dev/sdk';

init({
  dsn: 'https://your-server.com/api/v1/report',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  environment: 'production',
});
```

---

## 📚 Documentation

### Core Documentation

- [📋 PRD Requirements](docs/PRD/en/PRD.md) - Product positioning, feature requirements, acceptance criteria
- [🏛️ Architecture Design](docs/design/en/00-Architecture.md) - Monorepo configuration, inter-app communication
- [📦 SDK Design](docs/design/en/01-SDK-Design.md) - Plugin architecture, collection mechanisms
- [⚙️ Server Design](docs/design/en/02-Server-Design.md) - Data pipeline, fingerprint algorithm, AI module
- [🎨 Dashboard Design](docs/design/en/03-Dashboard-Design.md) - Issue localization workbench, routing design
- [📖 Development Guidelines](docs/development/en/rules.md) - Code standards, Git workflow, review checklist

### Multilingual Documentation

All documentation is available in Simplified Chinese, Traditional Chinese, English, and Japanese. See [docs/README.md](docs/README.md) for details.

---

## 🗓️ Roadmap

### P0-a: Collection Foundation (Week 1-2) ✅ In Progress

- [x] Project documentation completed
- [x] Development guidelines established
- [ ] Monorepo setup
- [ ] SDK core engine
- [ ] Server data ingestion
- [ ] Dashboard basic layout

### P0-b: Issue Localization (Week 3-5)

- [ ] Error fingerprint grouping
- [ ] SourceMap restoration
- [ ] Issue localization workbench
- [ ] Behavior timeline component
- [ ] Environment diff analysis

### P0-c: Blank Screen & API (Week 5-6)

- [ ] Blank screen detection plugin
- [ ] API monitoring plugin
- [ ] API exception issue type

### P1: AI Enhancement (Week 7-8)

- [ ] LLM Provider abstraction
- [ ] Error summary (automatic)
- [ ] Context analysis (manual)
- [ ] Fix direction suggestions

### P1: Alert Engine (Week 8-9)

- [ ] Alert rule engine
- [ ] Anomaly detection
- [ ] Notification channels (Webhook + Email)

### P2: Polish & Delivery (Week 9-10)

- [ ] Performance collection & analysis
- [ ] AI daily reports
- [ ] Dashboard overview page
- [ ] Documentation refinement

---

## 🤝 Contributing

We welcome all forms of contributions!

### Ways to Contribute

- 🐛 Submit bug reports
- 💡 Propose new features
- 📝 Improve documentation
- 🔧 Submit code fixes
- 🌍 Help translate documentation

### Development Workflow

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat(scope): add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Submit a Pull Request

See [Development Guidelines](docs/development/en/rules.md) for details.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

Thanks to all developers who have contributed to the Rewind project!

---

<!-- ## 📧 Contact

- Project Homepage: [GitHub](https://github.com/your-org/rewind)
- Issue Tracker: [Issues](https://github.com/your-org/rewind/issues)
- Email: dev@rewind.example.com

--- -->

<div align="center">

**Built with ❤️ by Rewind Team**

</div>
