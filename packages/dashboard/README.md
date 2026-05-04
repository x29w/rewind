# @rewind-dev/dashboard

Dashboard application for Rewind monitoring platform.

## Features

- ⚛️ **React 18** - Latest React with concurrent features
- 🎨 **Ant Design 5** - Enterprise-class UI design system
- 🗺️ **TanStack Router** - Type-safe file-based routing
- 🔄 **TanStack Query** - Powerful data synchronization
- 🏪 **Redux Toolkit** - Predictable state management
- ⚡ **Vite** - Lightning fast build tool
- 📘 **TypeScript** - Full type safety

## Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Project Structure

```
src/
├── routes/              # File-based routes
│   ├── __root.tsx      # Root layout
│   └── index.tsx       # Home page
├── components/          # React components
│   ├── common/         # Common UI components
│   ├── feature/        # Feature-specific components
│   └── config/         # Configuration components
├── store/              # Redux store
├── api/                # API client
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── main.tsx            # Application entry
```

## Routing

This project uses TanStack Router with file-based routing:

- `src/routes/__root.tsx` - Root layout
- `src/routes/index.tsx` - Home page (`/`)
- `src/routes/issues/index.tsx` - Issues list (`/issues`)
- `src/routes/issues/$issueId.tsx` - Issue detail (`/issues/:issueId`)

## State Management

- **Redux Toolkit**: Client state (auth, filters, UI state)
- **TanStack Query**: Server state (API data, caching)

## API Integration

API calls are proxied through Vite dev server:
- `/api/*` → `http://localhost:3000/api/*`

## Building

```bash
# Production build
pnpm build

# Output: dist/
```

## License

MIT
