# Orchestr-AI

Automatic analysis and visualization of microservice architectures.

## Overview

Orchestr-AI is a web application that scans microservice repositories, extracts REST API contracts, builds dependency graphs, and helps analyze the impact of changes on other services.

## Project Structure

This is a monorepo managed by [Turborepo](https://turbo.build/repo) and uses pnpm workspaces:

```
orchestr-ai/
├── apps/
│   ├── backend/          # NestJS backend application
│   └── frontend/         # React frontend application
├── packages/
│   ├── shared/           # Shared TypeScript types and utilities
│   └── config/           # Shared configurations (ESLint, TypeScript, Prettier)
├── turbo.json            # Turborepo configuration
└── package.json          # Root package.json with workspace configuration
```

## Prerequisites

- Node.js 20+ (LTS recommended)
- pnpm 8+ (`npm install -g pnpm`)
- PostgreSQL 15+ (for backend)
- Redis (for queue system and caching)
- Docker and Docker Compose (optional, for local development)

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy the example environment files and configure them:

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.example apps/frontend/.env
```

### 3. Start Development Services

Using Docker Compose (recommended):

```bash
docker-compose up -d
```

This will start PostgreSQL and Redis services.

### 4. Run Database Migrations

```bash
pnpm db:migrate
```

### 5. Start Development Servers

Start all apps in development mode:

```bash
pnpm dev
```

Or start them separately:

```bash
# Backend only
pnpm dev:backend

# Frontend only
pnpm dev:frontend
```

## Available Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm dev:backend` - Start backend only
- `pnpm dev:frontend` - Start frontend only
- `pnpm build` - Build all apps
- `pnpm test` - Run tests in all workspaces
- `pnpm lint` - Lint all workspaces
- `pnpm format` - Format code with Prettier
- `pnpm db:migrate` - Run database migrations
- `pnpm db:migrate:generate` - Generate migration from entities
- `pnpm db:migrate:revert` - Revert last migration

## Documentation

For detailed documentation, see the [memory_bank](./memory_bank/README.md) directory:

- [Project Context](./memory_bank/project_context.md) - Quick onboarding guide
- [Architecture Design](./memory_bank/architecture_design.md) - System design
- [Tech Stack](./memory_bank/tech_stack.md) - Technology choices
- [Current Tasks](./memory_bank/current_tasks.md) - Active work and status

## License

[To be determined]

