# Frontend Application

React frontend application for Orchestr-AI.

## Overview

This is the main frontend application built with:
- React 18+
- Vite (build tool)
- TypeScript
- React Router (navigation)
- React Query (state management and API caching)
- Axios (HTTP client)
- React Hook Form + Zod (form management)

## Getting Started

### Prerequisites

- Node.js 20+
- Backend API running (default: http://localhost:3000)

### Installation

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

- `VITE_API_URL` - Backend API URL (default: http://localhost:3000/api)

### Running the Application

```bash
# Development
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Testing

```bash
# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

#### Test Coverage Requirements

The project maintains minimum test coverage thresholds of **70%** for:
- Statements
- Branches
- Functions
- Lines

Coverage reports are generated in multiple formats:
- **HTML**: View detailed coverage in `coverage/index.html`
- **JSON**: Machine-readable format for CI/CD integration
- **LCOV**: For coverage badge integration
- **Text/Text-Summary**: Console output

The following files are excluded from coverage:
- Test files (`*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`)
- Type definitions (`*.d.ts`)
- Configuration files (`*.config.*`)
- Test directories (`test/`, `tests/`)
- Main entry point (`main.tsx`)
- Vite environment types (`vite-env.d.ts`)

Coverage thresholds are enforced in Vitest configuration. The test suite will fail if thresholds are not met.

## Project Structure

```
src/
├── main.tsx              # Application entry point
├── App.tsx               # Root component
├── index.css             # Global styles
├── components/           # Reusable React components
├── pages/                # Page components
├── hooks/                # Custom React hooks
├── services/             # API client and services
│   └── api.ts           # Axios client configuration
└── test/                 # Test setup files
```

## Related Documentation

- [Architecture Design](../../memory_bank/architecture_design.md)
- [Tech Stack](../../memory_bank/tech_stack.md)

