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

## 📖 Overview

Rewind is an intelligent frontend monitoring platform designed for developers, solving the critical pain point of **"can't reproduce, can't locate"** production errors.

### Core Features

- 🎯 **Behavior Recording & Replay** - Automatically records user actions, fully restoring "how the error happened"
- 🔍 **Issue Localization Workspace** - Source-level stack traces + operation timeline + environment analysis + AI insights
- 🧠 **AI-Powered Analysis** - Automatically organizes error context, suggests possible causes and fix directions
- 🎨 **Smart Deduplication** - Error fingerprinting algorithm automatically merges similar issues with >95% accuracy
- 👻 **Blank Screen Detection** - FCP timeout + DOM sampling dual detection, auto-correlates operation traces
- 📊 **Performance Monitoring** - Web Vitals collection and analysis
- 🚨 **Intelligent Alerting** - Automatic notifications for error spikes and issue regressions

### How It's Different

```
Traditional Monitoring:
Error occurs → See error → Manual investigation → Try to reproduce → Guess cause → Fix
                                    ↑ Most time-consuming and painful step

Rewind:
Error occurs → Auto-categorize → Restore trace → AI organizes clues → Locate & fix
                                    ↑ Core value: Every error is traceable
```

---

## 🏗️ Architecture

Rewind uses a **Monorepo** architecture with 3 core applications:

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

| Application | Technologies | Description |
|-------------|-------------|-------------|
| **SDK** | TypeScript + Rollup | Zero dependencies, gzip < 15KB |
| **Server** | NestJS + Prisma + PostgreSQL + Redis + BullMQ | Modular architecture, horizontally scalable |
| **Dashboard** | React 18 + Vite + Ant Design 5 + Redux Toolkit + TanStack Router | Type-safe routing, high-performance rendering |

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 9
- PostgreSQL >= 16
- Redis >= 7

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/rewind.git
cd rewind

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Development

```bash
# Start server
pnpm dev:server

# Start dashboard
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

### Core Documents

- [📋 PRD](docs/PRD/PRD.md) - Product positioning, feature requirements, acceptance criteria
- [🏛️ Architecture Design](docs/design/00-总体设计.md) - Monorepo configuration, inter-app communication
- [📦 SDK Design](docs/design/01-SDK设计.md) - Plugin architecture, collection mechanisms
- [⚙️ Server Design](docs/design/02-Server设计.md) - Data pipeline, fingerprinting algorithm, AI module
- [🎨 Dashboard Design](docs/design/03-Dashboard设计.md) - Issue localization workspace, routing design
- [📖 Development Rules](docs/development/rules.md) - Code standards, Git workflow, review checklist

### Multi-language Documentation

All documents are available in Simplified Chinese, Traditional Chinese, English, and Japanese. See [docs/README.md](docs/README.md)

---

## 🗓️ Roadmap

### P0-a: Collection Foundation (Week 1-2) ✅ In Progress

- [x] Project documentation complete
- [x] Development standards established
- [ ] Monorepo setup
- [ ] SDK core engine
- [ ] Server data reception
- [ ] Dashboard basic layout

### P0-b: Issue Localization (Week 3-5)

- [ ] Error fingerprinting & merging
- [ ] SourceMap restoration
- [ ] Issue localization workspace
- [ ] Behavior timeline component
- [ ] Environment difference analysis

### P0-c: Blank Screen & API (Week 5-6)

- [ ] Blank screen detection plugin
- [ ] API monitoring plugin
- [ ] API error issue type

### P1: AI Enhancement (Week 7-8)

- [ ] LLM Provider abstraction
- [ ] Error summary (automatic)
- [ ] Context analysis (manual)
- [ ] Fix direction suggestions

### P1: Alerting Engine (Week 8-9)

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

We welcome all forms of contribution!

### Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit code fixes
- 🌍 Help translate documentation

### Development Process

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat(scope): add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Submit a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

Thanks to all developers who have contributed to the Rewind project!

---

## 📧 Contact

- Project Homepage: [GitHub](https://github.com/your-org/rewind)
- Issue Tracker: [Issues](https://github.com/your-org/rewind/issues)
- Email: dev@rewind.example.com

---

<div align="center">

**Built with ❤️ by Rewind Team**

</div>
