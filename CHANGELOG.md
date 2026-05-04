# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2026-05-04

- **build**: Initialize monorepo infrastructure with pnpm workspaces and Turborepo
- **build**: Add root package.json with workspace configuration and build scripts
- **build**: Add Turborepo configuration for build pipeline orchestration
- **build**: Add pnpm configuration file (.npmrc) with peer dependency settings
- **build**: Add shared package with TypeScript types for breadcrumb, device, event, and issue
- **build**: Add compiled JavaScript files for dashboard (main.js, routeTree.gen.js, store/index.js)
- **build**: Add pnpm-lock.yaml for dependency locking

### Changed - 2026-05-04

- **docs**: Add code cleanup section (1.6) to Chinese development rules
- **docs**: Add guidelines for detecting and removing unused code, variables, functions, and dependencies
- **docs**: Renumber function declaration section from 1.6 to 1.7 in Chinese development rules
- **docs**: Fix typo in Chinese development rules (实用 → 使用)
- **chore**: Simplify changelog update hook prompt to remove bilingual structure requirement
- **refactor**: Replace namespace imports with named type imports in SDK client and types
- **refactor**: Export individual types instead of namespace from shared package
- **build**: Remove TypeScript compilation from dashboard build script (use Vite only)
- **build**: Update Turborepo config from deprecated "pipeline" to "tasks" field
- **feat**: Add QueryClient context to TanStack Router root route in dashboard
- **build**: Disable strict mode in dashboard TypeScript config (keep strictNullChecks enabled)
- **build**: Remove allowImportingTsExtensions from dashboard TypeScript config

---

## [0.1.0] - Initial Release

### Added

- Project documentation structure with multilingual support (English, Japanese, Chinese, Traditional Chinese)
- Product Requirements Document (PRD) in multiple languages
- Architecture and design documents for SDK, Server, and Dashboard
- Development rules and guidelines
- Initial project specifications for P0 features
- MIT License
- Contributing guidelines
