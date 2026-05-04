# Contributing to Rewind

Thank you for your interest in contributing to Rewind! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9.15.0
- PostgreSQL >= 16 (for server development)
- Redis >= 7 (for server development)

### Setup

1. **Fork and clone the repository**

```bash
git clone https://github.com/your-username/rewind.git
cd rewind
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Build all packages**

```bash
pnpm build
```

4. **Start development**

```bash
# Start server
pnpm dev:server

# Start dashboard
pnpm dev:dashboard

# Build SDK
pnpm build:sdk
```

## 🔄 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/your-bug-fix
```

Branch naming conventions:
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `perf/*` - Performance improvements

### 2. Make Changes

- Follow the [coding standards](docs/development/rules.md)
- Write tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run tests
pnpm test

# Run linter
pnpm lint

# Type check
pnpm type-check
```

### 4. Commit Your Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
git commit -m "feat(sdk): add blank screen detection"
git commit -m "fix(server): resolve fingerprint collision"
git commit -m "docs: update API documentation"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 📏 Coding Standards

### General Rules

- **File naming**: Use `kebab-case` for all files (e.g., `error-handler.ts`)
- **Comments**: All public APIs must have multi-language comments (Chinese, English, Japanese)
- **Type definitions**: Use `declare namespace` for type organization
- **No dynamic imports**: Avoid `import()` except for React lazy loading
- **No setTimeout**: Use proper async patterns instead

### SDK Specific

- **Zero dependencies**: No runtime dependencies allowed
- **Error isolation**: All code must be wrapped in try-catch
- **Bundle size**: Core < 10KB gzip, full < 15KB gzip

### Server Specific

- **No .spec.ts files**: Focus on integration and E2E tests
- **Database**: Use PostgreSQL (not MySQL)
- **API design**: Follow RESTful conventions

### Dashboard Specific

- **No unnecessary hooks**: Avoid `useEffect`/`useCallback` unless truly needed
- **Redux**: Store data only, no business logic
- **State management**: Use TanStack Query for server state

See [Development Rules](docs/development/rules.md) for complete guidelines.

## 📝 Commit Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test updates
- `chore`: Build/tooling changes

### Scopes

- `sdk`: SDK package
- `server`: Server package
- `dashboard`: Dashboard package
- `shared`: Shared types package
- `docs`: Documentation
- `ci`: CI/CD

### Examples

```bash
feat(sdk): add behavior recording plugin
fix(server): resolve race condition in fingerprint calculation
docs(readme): update installation instructions
refactor(dashboard): simplify issue list component
perf(sdk): optimize breadcrumb buffer performance
test(server): add integration tests for ingestion module
chore(ci): update GitHub Actions workflow
```

## 🔍 Pull Request Process

### Before Submitting

1. ✅ Ensure all tests pass
2. ✅ Run linter and fix all issues
3. ✅ Update documentation if needed
4. ✅ Add tests for new features
5. ✅ Follow commit message conventions
6. ✅ Rebase on latest `develop` branch

### PR Requirements

- **Title**: Follow commit message format
- **Description**: Use the PR template
- **Tests**: Include test results
- **Screenshots**: Add for UI changes
- **Breaking changes**: Clearly document

### Review Process

1. At least 1 approval required
2. All CI checks must pass
3. All review comments must be resolved
4. Maintainer will merge when ready

## 🧪 Testing

### Running Tests

```bash
# All tests
pnpm test

# Specific package
pnpm --filter @rewind-dev/sdk test

# Watch mode
pnpm --filter @rewind-dev/sdk test:watch

# Coverage
pnpm test:coverage
```

### Writing Tests

- Use Vitest for SDK and Server
- Use React Testing Library for Dashboard
- Aim for >80% coverage for core features
- Test edge cases and error handling

### Test Structure

```typescript
describe('FeatureName', () => {
  it('should handle normal case', () => {
    // Arrange
    // Act
    // Assert
  });

  it('should handle edge case', () => {
    // ...
  });

  it('should handle error case', () => {
    // ...
  });
});
```

## 📚 Documentation

### What to Document

- **Public APIs**: All exported functions, classes, interfaces
- **Complex logic**: Non-obvious implementation details
- **Breaking changes**: Migration guides
- **Examples**: Usage examples for new features

### Documentation Style

- Use multi-language comments (Chinese, English, Japanese)
- Keep it concise and clear
- Include code examples
- Update relevant markdown files

### Documentation Files

- `README.md`: Project overview and quick start
- `docs/PRD/`: Product requirements
- `docs/design/`: Architecture and design docs
- `docs/development/`: Development guidelines
- `CHANGELOG.md`: Version history

## 🌍 Translation

We welcome translations of documentation!

Current languages:
- 简体中文 (Simplified Chinese) - Primary
- 繁體中文 (Traditional Chinese)
- English
- 日本語 (Japanese)

To contribute translations:
1. Check `docs/README.md` for translation status
2. Translate the document
3. Submit a PR with the translation
4. Ensure formatting is consistent

## 🐛 Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

## 💡 Suggesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:
- Feature description
- Motivation and use case
- Proposed solution
- Alternatives considered

## 📧 Getting Help

- **Issues**: [GitHub Issues](https://github.com/your-org/rewind/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/rewind/discussions)
- **Email**: dev@rewind.example.com

## 🙏 Thank You!

Your contributions make Rewind better for everyone. We appreciate your time and effort! ❤️

---

**Happy Contributing! 🚀**
