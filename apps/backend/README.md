# Backend Application

NestJS backend application for Orchestr-AI.

## Overview

This is the main backend API that handles:
- Repository indexing
- Contract extraction
- Dependency graph building
- Change analysis
- System/Service/Contract management

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis

### Installation

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `DB_HOST` - PostgreSQL host
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_DATABASE` - Database name
- `REDIS_HOST` - Redis host

Optional environment variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production/test)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)
- `LOG_LEVEL` - Logging level (error/warn/info/debug, default: info)
- `DB_SYNCHRONIZE` - Auto-sync database schema (default: false, use migrations in production)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password (optional)
- `REDIS_DB` - Redis database number (default: 0)
- `JWT_SECRET` - JWT secret key (optional, for future auth)

All environment variables are validated on application startup using class-validator.

### Running the Application

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start:prod
```

### Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts          # Root module
├── app.controller.ts      # Root controller
├── app.service.ts         # Root service
├── systems/               # System management module
│   ├── systems.module.ts
│   ├── systems.controller.ts
│   └── systems.service.ts
├── services/              # Service management module
│   ├── services.module.ts
│   ├── services.controller.ts
│   └── services.service.ts
├── contracts/             # Contract management module
│   ├── contracts.module.ts
│   ├── contracts.controller.ts
│   └── contracts.service.ts
├── indexer/               # Repository indexing module
│   ├── indexer.module.ts
│   ├── indexer.controller.ts
│   └── indexer.service.ts
├── extractor/             # Contract extraction module
│   ├── extractor.module.ts
│   ├── extractor.controller.ts
│   └── extractor.service.ts
├── analyzer/              # Change analysis module
│   ├── analyzer.module.ts
│   ├── analyzer.controller.ts
│   └── analyzer.service.ts
├── visualization/         # Graph building module
│   ├── visualization.module.ts
│   ├── visualization.controller.ts
│   └── visualization.service.ts
└── database/              # Database configuration and migrations
```

Each module follows NestJS conventions with:
- `*.module.ts` - Module definition
- `*.controller.ts` - HTTP endpoints
- `*.service.ts` - Business logic
- `dto/` - Data Transfer Objects (to be added)
- `entities/` - TypeORM entities (to be added)

## Related Documentation

- [Architecture Design](../../memory_bank/architecture_design.md)
- [Graph Storage Schema](../../memory_bank/patterns/graph_storage_schema.md)
- [Tech Stack](../../memory_bank/tech_stack.md)

