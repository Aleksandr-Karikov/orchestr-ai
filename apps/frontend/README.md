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

