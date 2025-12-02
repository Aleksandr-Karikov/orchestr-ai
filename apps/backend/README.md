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

#### E2E Test Setup

E2E tests use a separate test database (`orchestr_ai_test` by default) to avoid conflicts with development data. The test database is automatically cleaned up before each test.

**Environment Variables for E2E Tests:**

- `DB_DATABASE_TEST` - Test database name (default: `orchestr_ai_test`)
- All other database connection variables are the same as development

**E2E Test Files:**

- `test/app.e2e-spec.ts` - Basic app controller tests ✅
- `test/health.e2e-spec.ts` - Health check endpoint tests ✅
- `test/systems.e2e-spec.ts` - System CRUD operations tests (skipped until controllers implemented)
- `test/services.e2e-spec.ts` - Service CRUD operations with relationships tests (skipped until controllers implemented)
- `test/contracts.e2e-spec.ts` - Contract CRUD operations and versioning tests (skipped until controllers implemented)
- `test/indexer.e2e-spec.ts` - Indexing workflow tests (skipped until controllers implemented)
- `test/error-handling.e2e-spec.ts` - Error handling tests (404, 400, 500) (skipped until controllers implemented)
- `test/rate-limiting.e2e-spec.ts` - Rate limiting tests (skipped until controllers implemented)

**Note:** Some E2E tests are currently skipped (`.skip`) because the controllers don't have endpoints implemented yet. Once you implement the controller endpoints (POST, GET, PUT, DELETE), remove `.skip` from the describe blocks to enable the tests.

**Test Utilities:**

- `test/test-setup.ts` - Test setup utilities for database cleanup and app creation

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

- Test files (`*.spec.ts`, `*.test.ts`)
- Type definitions (`*.d.ts`, `*.interface.ts`)
- Data Transfer Objects (`*.dto.ts`)
- Database migrations
- Main entry point (`main.ts`)
- Test directories

**Note**: Coverage thresholds (70% minimum) are configured as a project requirement. Currently, threshold enforcement is disabled due to a known compatibility issue between Jest 29 and the v8 coverage provider. Thresholds will be re-enabled once sufficient test coverage is achieved or when the Jest issue is resolved. The target remains **70%** coverage for all metrics.

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
- `entities/` - MikroORM entities

### Database Migrations

The project uses MikroORM for database management. Migrations are configured in `src/database/mikro-orm.config.ts`.

```bash
# Run pending migrations
pnpm db:migrate

# Create a new migration
pnpm db:migrate:generate

# Revert last migration
pnpm db:migrate:revert

# List all migrations
pnpm db:migrate:show

# Create blank migration
pnpm db:migrate:create
```

## Related Documentation

- [Architecture Design](../../memory_bank/architecture_design.md)
- [Graph Storage Schema](../../memory_bank/patterns/graph_storage_schema.md)
- [Tech Stack](../../memory_bank/tech_stack.md)
