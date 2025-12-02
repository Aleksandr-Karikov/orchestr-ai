# Project Context - Onboarding Guide

## Quick Overview

Orchestr-AI is a web application for automatic analysis and visualization of microservice architectures. The system scans microservice repositories, extracts REST API contracts, builds dependency graphs, and helps analyze the impact of changes on other services.

## Key Concepts

### System

High-level entity that groups related microservices. The user creates a system and specifies repositories of all microservices that belong to it.

### Service

Individual microservice in the system. Each service has:

- Link to Git repository
- Extracted contracts (REST API endpoints)
- Dependencies on other services

### Contract

Description of an API endpoint between services:

- HTTP method and path
- Request parameters
- Request/response body schema (JSON Schema)
- Relationship with other services (who calls this endpoint)

### Dependency Graph

Visualization of connections between services, where:

- Nodes = services
- Edges = contracts/dependencies
- Direction = who calls whom

## Project Structure

The project is organized as a monorepo using Turborepo:

```
orchestr-ai/
├── apps/
│   ├── backend/            # NestJS application
│   │   ├── src/
│   │   │   ├── systems/        # System management
│   │   │   ├── services/       # Service management
│   │   │   ├── contracts/      # Contract management
│   │   │   ├── indexer/        # Repository indexing
│   │   │   ├── extractor/      # Contract extraction
│   │   │   ├── analyzer/       # Change analysis
│   │   │   └── visualization/  # Graph building
│   │   └── test/
│   └── frontend/           # React application
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── pages/          # Application pages
│       │   ├── hooks/          # Custom hooks
│       │   └── services/       # API clients
│       └── public/
├── packages/               # Shared packages
│   ├── shared/            # Shared types and utilities
│   ├── config/            # Configurations (ESLint, TypeScript)
│   └── database/          # Shared DB schemas (if needed)
├── .memory_bank/          # Project documentation
├── turbo.json             # Turborepo configuration
├── package.json           # Root package.json
└── docker-compose.yml     # Local development
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm/yarn
- PostgreSQL 15+
- Git (for cloning repositories)
- Docker and Docker Compose (optional, for local development)

### Setup Steps

1. Clone the repository and install dependencies:

   ```bash
   npm install  # or pnpm install
   ```

2. Set up PostgreSQL and create the database:

   ```bash
   createdb orchestr_ai
   ```

3. Configure environment variables:

   - `apps/backend/.env` - variables for backend
   - `apps/frontend/.env` - variables for frontend

4. Run database migrations:

   ```bash
   npm run db:migrate  # or via turbo
   ```

5. Start the application (via Turborepo):

   ```bash
   # Start all apps in dev mode
   npm run dev

   # Or separately:
   npm run dev:backend
   npm run dev:frontend
   ```

## Common Workflows

### For New Contributors

1. Read [Product Brief](./product_brief.md) to understand the WHY
2. Review [Architecture Design](./architecture_design.md) to understand the HOW
3. Check [Current Tasks](./current_tasks.md) for active work
4. Review relevant [Guides](./guides/) for your area

### For Agents

1. Start with [README.md](./README.md) for navigation
2. Check [Current Tasks](./current_tasks.md) for assigned work
3. Follow relevant [Workflows](./workflows/) for process steps
4. Reference [Patterns](./patterns/) for architectural decisions

## Key Files & Locations

- **Backend Entry**: `apps/backend/src/main.ts`
- **Frontend Entry**: `apps/frontend/src/main.tsx` or `index.tsx`
- **Database Schema**: `apps/backend/src/database/migrations/`
- **API Routes**: `apps/backend/src/*/controllers/`
- **Configuration**: `.env` files in apps/backend and apps/frontend
- **Tests**: `apps/backend/test/`, `apps/frontend/src/**/*.test.tsx`
- **Documentation**: `.memory_bank/`

## Important Context

### Historical Decisions

- **PostgreSQL instead of Neo4j**: For MVP, a relational model with JSON fields is sufficient. The graph can be modeled through table relationships. Neo4j can be added later if needed.
- **TypeScript everywhere**: Single language for frontend and backend simplifies development and maintenance.
- **NestJS for backend**: Modular architecture is well-suited for microservice analysis, built-in TypeORM and validation support.

### Current State

- Project in MVP 1.0 stage
- Focus on Spring Boot + OpenAPI/Swagger
- Basic dependency graph visualization
- Manual contract editing in UI

### Known Issues

- LLM contract extraction not in MVP (only static analysis)
- Only REST API support (GraphQL, gRPC - in the future)
- Vector databases for semantic code search - not in MVP

## Related Documentation

- [Architecture Design](./architecture_design.md) - System design details
- [Tech Stack](./tech_stack.md) - Technology details
- [Product Brief](./product_brief.md) - Project vision

---

_This is your starting point. Use the links above to dive deeper._
