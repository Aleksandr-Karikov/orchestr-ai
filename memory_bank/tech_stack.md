# Tech Stack

## Technology Passport

### Core Technologies

#### Language & Runtime

- **Language**: TypeScript
- **Version**: TypeScript 5.0+, Node.js 20+
- **Rationale**: Single language for frontend and backend, type safety, large ecosystem

#### Framework & Libraries

**Backend:**

- **Framework**: NestJS 10+
  - Modular architecture, built-in TypeORM support, validation
- **Key Libraries**:
  - `@nestjs/typeorm` - ORM for working with PostgreSQL
  - `@nestjs/config` - Configuration management
  - `@nestjs/jwt` - JWT authentication
  - `@nestjs/bullmq` - Queue management for asynchronous tasks
  - `@nestjs/throttler` - Rate limiting for API endpoints
  - `bullmq` - Redis-based queue for job processing
  - `winston` or `pino` - Structured logging (JSON format)
  - `swagger-parser` - Parsing OpenAPI/Swagger files
  - `tree-sitter-java` - Parsing Java code to extract annotations (recommended: better error recovery, incremental parsing)
    - Alternative: `java-parser` if tree-sitter doesn't meet requirements
  - `simple-git` - Working with Git repositories
  - `json-schema-diff` - Comparing JSON schemas for change analysis

**Frontend:**

- **Framework**: React 18+
  - Component-based approach, large ecosystem
- **Key Libraries**:
  - `react-flow` or `vis-network` - Graph visualization
  - `react-query` - State management and API request caching (recommended for MVP)
  - `react-hook-form` - Form management
  - `zod` - Schema validation (compatible with TypeScript)
  - `axios` - HTTP client

#### Database & Storage

- **Primary DB**: PostgreSQL 15+
  - Reliable relational database, JSON field support for storing contract schemas
  - Schema: See [Graph Storage Schema](./patterns/graph_storage_schema.md)
- **ORM**: TypeORM 0.3+
  - Migrations, typed queries, PostgreSQL JSON support
- **Queue System**: Redis + BullMQ
  - Asynchronous job processing for repository indexing
  - Task queues for contract extraction
  - Job retry and failure handling
- **Caching**: Redis (shared with queue system)
  - Graph caching for fast visualization
  - Contract version caching
  - LLM response caching (future) - to reduce API costs

#### Monorepo & Build Tools

- **Monorepo Tool**: Turborepo
  - Managing dependencies between packages
  - Build caching to speed up development
  - Parallel task execution
- **Package Manager**: pnpm or npm workspaces
  - Efficient dependency management in monorepo

#### Infrastructure

- **Deployment**: Docker, Docker Compose (for development)
- **CI/CD**: GitHub Actions (planned)
- **Monitoring**: (Future) Prometheus, Grafana

#### AI/LLM Integration (Future)

- **LLM Providers**:
  - OpenAI API (GPT-4, GPT-3.5) - for contract extraction and analysis
  - Anthropic Claude API - alternative provider
  - Local models (Ollama, LM Studio) - for on-premise deployments
- **Key Libraries**:
  - `openai` - OpenAI API client
  - `@anthropic-ai/sdk` - Anthropic API client
  - `langchain` (optional) - LLM orchestration and prompt management
- **Purpose**:
  - Enhanced contract extraction from complex or undocumented code
  - Semantic dependency detection
  - Natural language documentation generation
  - Intelligent breaking change analysis

## Technology Rules & Constraints

### ✅ Allowed Technologies

- TypeScript - main project language
- NestJS - backend framework
- React - frontend framework
- PostgreSQL - primary database
- TypeORM - ORM for PostgreSQL
- Redis - queue system and caching
- BullMQ - job queue management
- Docker - containerization

### ❌ Prohibited Technologies

- MongoDB/NoSQL databases - using PostgreSQL for structured data
- GraphQL - only REST API in MVP
- Python - all code in TypeScript for consistency

### Version Constraints

- Node.js: >= 20.0.0 (LTS version)
- TypeScript: >= 5.0.0
- PostgreSQL: >= 15.0
- React: >= 18.0.0

## Development Standards

### Code Style

- ESLint with TypeScript configuration
- Prettier for code formatting
- TypeScript strict mode (`strict: true`)
- Naming: camelCase for variables, PascalCase for classes/components

### Testing

- **Backend**: Jest (built into NestJS)
- **Frontend**: Vitest + React Testing Library
- **Coverage requirements**: Minimum 70% for critical services

### Documentation

- JSDoc comments for public APIs
- README for each module
- OpenAPI/Swagger documentation for REST API (auto-generated via NestJS)

## Adding New Technologies

Before adding a new technology:

1. Check this document for constraints
2. Update [Architecture Design](./architecture_design.md) if needed
3. Document rationale here

## Language Support

For adding support for new programming languages, see:

- [Adding New Language Guide](./guides/adding_new_language.md)

## Related Documentation

- [Architecture Design](./architecture_design.md) - How technologies are used
- [Product Brief](./product_brief.md) - Business context for tech choices

---

_For implementation guides, see [Guides](./guides/)_
