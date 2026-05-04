# Biome Setup Guide

## Overview

This project uses [Biome](https://biomejs.dev/) as the unified code quality tool, replacing ESLint and Prettier for faster linting and formatting.

## Features

- ⚡ **Fast**: 25x faster than ESLint
- 🔧 **All-in-one**: Linting + Formatting + Import sorting
- 📦 **Zero config**: Works out of the box
- 🎯 **Type-aware**: Understands TypeScript
- 🔄 **Compatible**: Drop-in replacement for ESLint/Prettier

## Installation

Biome is already configured in the project. Just install dependencies:

```bash
pnpm install
```

## Usage

### Command Line

```bash
# Check all files
pnpm lint

# Check and fix all files
pnpm lint:fix

# Format all files
pnpm format

# Check specific files
biome check src/

# Format specific files
biome format --write src/
```

### IDE Integration

#### VS Code

1. Install the Biome extension:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Biome"
   - Install "Biome" by biomejs

2. The project already includes `.vscode/settings.json` with Biome configuration:
   - Format on save enabled
   - Organize imports on save
   - Biome as default formatter

#### Other IDEs

- **WebStorm/IntelliJ**: Use the Biome plugin
- **Neovim**: Use `nvim-lspconfig` with Biome LSP
- **Sublime Text**: Use LSP-biome package

## Configuration

The project's Biome configuration is in `biome.json`:

```json
{
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

### Key Settings

- **Indent**: 2 spaces
- **Line width**: 100 characters
- **Quote style**: Single quotes for JS/TS, double for JSX
- **Semicolons**: Always
- **Trailing commas**: ES5 style

## Git Hooks

To ensure code quality, set up Git hooks:

```bash
# Install husky
pnpm add -D husky

# Initialize husky
pnpm exec husky init

# Add pre-commit hook
echo "pnpm lint:fix" > .husky/pre-commit
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Lint
  run: pnpm lint

- name: Type check
  run: pnpm type-check
```

## Migration from ESLint/Prettier

If you're migrating from ESLint/Prettier:

1. ✅ Remove ESLint and Prettier dependencies (already done)
2. ✅ Remove `.eslintrc`, `.prettierrc` files (not needed)
3. ✅ Update package.json scripts (already done)
4. ✅ Configure Biome (already done)
5. ✅ Update IDE settings (already done)

## Rules

### Enabled Rules

- **Recommended rules**: All Biome recommended rules
- **Import sorting**: Automatic import organization
- **Type imports**: Enforce `import type` for types
- **Node.js imports**: Use `node:` protocol

### Disabled Rules

- `noForEach`: Allow forEach (common pattern)
- `noNonNullAssertion`: Allow `!` operator (TypeScript)

### Warnings

- `noExplicitAny`: Warn on `any` type
- `noArrayIndexKey`: Warn on array index as key
- `noExcessiveCognitiveComplexity`: Warn on complex functions

## Troubleshooting

### Biome not formatting on save

1. Check VS Code settings: `Ctrl+,` → search "format on save"
2. Ensure Biome extension is installed and enabled
3. Check `.vscode/settings.json` exists

### Biome command not found

```bash
# Install Biome globally
npm install -g @biomejs/biome

# Or use pnpm
pnpm add -g @biomejs/biome
```

### Conflicts with existing formatters

Disable other formatters in VS Code settings:
- Prettier: `"prettier.enable": false`
- ESLint: `"eslint.enable": false`

## Resources

- [Biome Documentation](https://biomejs.dev/)
- [Biome VS Code Extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- [Biome GitHub](https://github.com/biomejs/biome)

## Support

For issues or questions:
1. Check [Biome documentation](https://biomejs.dev/guides/getting-started/)
2. Search [GitHub issues](https://github.com/biomejs/biome/issues)
3. Ask in project discussions

---

**Note**: Biome is actively developed and new features are added regularly. Keep it updated:

```bash
pnpm update @biomejs/biome
```
