# Current Tasks - Live Project Kanban

## 📊 Status Legend

- 🔴 **Blocked** - Cannot proceed
- 🟡 **In Progress** - Actively working
- 🟢 **Ready** - Ready to start
- ⚪ **Backlog** - Future work
- ✅ **Done** - Completed

## Current Sprint / Phase

**Phase 1.2: Indexing and Contract Extraction**

### Active Tasks

#### Phase 1.1.1: Monorepo Foundation

##### ✅ Initialize Turborepo Monorepo

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Set up the monorepo structure using Turborepo. This is the foundation for all other tasks.
- **Acceptance Criteria**:
  - [x] Initialize npm/pnpm workspace in root directory
  - [x] Install and configure Turborepo (`turbo` package)
  - [x] Create `turbo.json` with build, dev, test, and lint pipelines
  - [x] Create root `package.json` with workspace configuration
  - [x] Create basic directory structure: `apps/` and `packages/`
  - [x] Configure `.gitignore` for monorepo (node_modules, build outputs, etc.)
  - [x] Add README.md with basic monorepo setup instructions
- **Related**: [Tech Stack](./tech_stack.md), [Project Context](./project_context.md), [MVP Spec Phase 1.1](./specs/mvp_spec_phase_1.md)
- **Status**: Done
- **Dependencies**: None

##### ✅ Configure Package Manager and Workspaces

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Set up package manager (pnpm recommended) with workspace support for efficient dependency management.
- **Acceptance Criteria**:
  - [x] Choose and configure package manager (pnpm or npm workspaces)
  - [x] Create workspace configuration in root `package.json`
  - [x] Set up shared dependency management strategy
  - [x] Configure hoisting/sharing rules for common dependencies
  - [x] Add scripts for installing dependencies across workspaces
  - [x] Test workspace dependency resolution
- **Related**: [Tech Stack](./tech_stack.md)
- **Status**: Done
- **Dependencies**: Initialize Turborepo Monorepo

#### Phase 1.1.2: Shared Packages Setup

##### ✅ Create Shared Types Package

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Create `packages/shared` package with shared TypeScript types and utilities used by both backend and frontend.
- **Acceptance Criteria**:
  - [x] Create `packages/shared` directory structure
  - [x] Initialize package.json with proper name and exports
  - [x] Set up TypeScript configuration
  - [x] Create shared types for: System, Service, Contract, ContractVersion entities
  - [x] Create shared types for API request/response DTOs
  - [x] Create shared enums (IndexingStatus, SourceType, UsageType, etc.)
  - [x] Export types in index.ts
  - [x] Reference types from Graph Storage Schema documentation
- **Related**: [Graph Storage Schema](./patterns/graph_storage_schema.md), [Architecture Design](./architecture_design.md)
- **Status**: Done
- **Dependencies**: Configure Package Manager and Workspaces

##### ✅ Create Shared Config Package

- **Assignee**: [TBD]
- **Priority**: Medium
- **Description**: Create `packages/config` package with shared ESLint, TypeScript, and Prettier configurations.
- **Acceptance Criteria**:
  - [x] Create `packages/config` directory structure
  - [x] Set up shared ESLint configuration (TypeScript, React, NestJS rules)
  - [x] Set up shared TypeScript configuration (strict mode enabled)
  - [x] Set up shared Prettier configuration
  - [x] Create package.json with proper exports for config files
  - [x] Document usage in README
- **Related**: [Tech Stack](./tech_stack.md)
- **Status**: Done
- **Dependencies**: Configure Package Manager and Workspaces

#### Phase 1.1.3: Backend Application Setup

##### ✅ Initialize NestJS Backend Application

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Initialize NestJS application in `apps/backend` with basic structure and configuration.
- **Acceptance Criteria**:
  - [x] Create `apps/backend` directory
  - [x] Initialize NestJS application using CLI
  - [x] Configure TypeScript with strict mode
  - [x] Set up ESLint and Prettier using shared config package
  - [x] Create basic folder structure: `src/` with subdirectories for modules
  - [x] Configure build output directory
  - [x] Set up test configuration (Jest)
  - [x] Create `main.ts` entry point with basic app setup
- **Related**: [Tech Stack](./tech_stack.md), [Architecture Design](./architecture_design.md), [Project Context](./project_context.md)
- **Status**: Done
- **Dependencies**: Create Shared Config Package

##### ✅ Setup Backend Module Structure

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Create module structure for core backend services as defined in architecture.
- **Acceptance Criteria**:
  - [x] Create module directories: `systems/`, `services/`, `contracts/`, `indexer/`, `extractor/`, `analyzer/`, `visualization/`
  - [x] Create basic module files (.module.ts) for each module
  - [x] Set up module structure with controllers, services, DTOs folders
  - [x] Create placeholder controllers and services
  - [x] Register modules in AppModule
  - [x] Document module structure in README
- **Related**: [Architecture Design](./architecture_design.md), [Project Context](./project_context.md)
- **Status**: Done
- **Dependencies**: Initialize NestJS Backend Application

##### ✅ Configure Backend Environment Variables

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Set up environment variable configuration with validation and template files.
- **Acceptance Criteria**:
  - [x] Install and configure `@nestjs/config` module
  - [x] Create `.env.example` file with all required variables
  - [x] Create environment variable schema/validation (using zod or class-validator)
  - [x] Define variables for: database connection, Redis connection, server port, logging level
  - [x] Configure ConfigModule in AppModule
  - [x] Document environment variables in README
- **Related**: [Tech Stack](./tech_stack.md), [Project Context](./project_context.md)
- **Status**: Done
- **Dependencies**: Initialize NestJS Backend Application

#### Phase 1.1.4: Frontend Application Setup

##### ✅ Initialize React Frontend Application

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Initialize React application in `apps/frontend` with modern tooling (Vite recommended).
- **Acceptance Criteria**:
  - [x] Create `apps/frontend` directory
  - [x] Initialize React application with Vite (or Webpack)
  - [x] Configure TypeScript with strict mode
  - [x] Set up ESLint and Prettier using shared config package
  - [x] Configure build and dev scripts
  - [x] Set up test configuration (Vitest + React Testing Library)
  - [x] Create basic folder structure: `src/components/`, `src/pages/`, `src/hooks/`, `src/services/`
  - [x] Create main entry point (`main.tsx` or `index.tsx`)
- **Related**: [Tech Stack](./tech_stack.md), [Architecture Design](./architecture_design.md), [Project Context](./project_context.md)
- **Status**: Done
- **Dependencies**: Create Shared Config Package

##### ✅ Setup Frontend Dependencies and Structure

- **Assignee**: [TBD]
- **Priority**: Medium
- **Description**: Install and configure frontend dependencies for UI components, state management, and API clients.
- **Acceptance Criteria**:
  - [x] Install React 18+ and React DOM
  - [x] Install and configure React Router for navigation
  - [x] Install react-query for state management and API caching
  - [x] Install axios for HTTP client
  - [x] Install react-hook-form and zod for form management
  - [x] Install UI library or set up basic component structure
  - [x] Create API client service structure
  - [x] Set up environment variable configuration for API URL
- **Related**: [Tech Stack](./tech_stack.md)
- **Status**: Done
- **Dependencies**: Initialize React Frontend Application

#### Phase 1.1.5: Database Infrastructure

##### ✅ Setup TypeORM and PostgreSQL Connection

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Configure TypeORM in NestJS backend with PostgreSQL database connection.
- **Acceptance Criteria**:
  - [x] Install `@nestjs/typeorm`, `typeorm`, and `pg` packages
  - [x] Configure TypeOrmModule in AppModule with database connection
  - [x] Set up database connection using environment variables
  - [x] Configure connection pool settings
  - [x] Test database connectivity
  - [x] Add database connection error handling
- **Related**: [Tech Stack](./tech_stack.md), [Graph Storage Schema](./patterns/graph_storage_schema.md)
- **Status**: Done
- **Dependencies**: Configure Backend Environment Variables

##### ✅ Create Database Entities

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Create TypeORM entities for all database tables according to Graph Storage Schema.
- **Acceptance Criteria**:
  - [x] Create System entity with all properties
  - [x] Create Service entity with all properties and relationships
  - [x] Create Contract entity with all properties and JSONB fields
  - [x] Create ContractVersion entity with snapshot JSONB field
  - [x] Create ServiceContractUsage entity with relationships
  - [x] Configure all relationships (one-to-many, many-to-one, many-to-many)
  - [x] Configure enums for status fields
  - [x] Add proper indexes as specified in schema
  - [x] Validate entity structure matches Graph Storage Schema
- **Related**: [Graph Storage Schema](./patterns/graph_storage_schema.md)
- **Status**: Done
- **Dependencies**: Setup TypeORM and PostgreSQL Connection

##### ✅ Create Database Migration System

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Set up MikroORM migration system and create initial migration for all tables.
- **Acceptance Criteria**:
  - [x] Configure MikroORM migration settings in MikroORM config
  - [x] Create migrations directory structure
  - [x] Create initial migration that creates all tables:
    - `systems` table
    - `services` table
    - `contracts` table
    - `contract_versions` table
    - `service_contract_usage` table
  - [x] Add all required columns with correct types (UUID, VARCHAR, TEXT, JSONB, TIMESTAMP, ENUM)
  - [x] Configure foreign key constraints
  - [x] Add B-Tree indexes as specified in schema
  - [x] Add GIN indexes for all JSONB fields (request_schema, response_schema, parameters, snapshot, metadata)
  - [x] Create migration scripts in package.json
  - [x] Migration file created with up/down methods
- **Related**: [Graph Storage Schema](./patterns/graph_storage_schema.md), [MVP Spec Phase 1.1](./specs/mvp_spec_phase_1.md)
- **Status**: Done
- **Dependencies**: Create Database Entities

#### Phase 1.1.6: Queue System Setup

##### ✅ Setup Redis Configuration

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Configure Redis connection for BullMQ job queues and caching.
- **Acceptance Criteria**:
  - [x] Install `ioredis` or `redis` package
  - [x] Configure Redis connection using environment variables
  - [x] Set up connection options (host, port, password, database number)
  - [x] Add Redis connection error handling
  - [x] Create RedisModule with connection management
  - [x] Document Redis configuration requirements
- **Related**: [Tech Stack](./tech_stack.md), [Architecture Design](./architecture_design.md)
- **Status**: Done
- **Dependencies**: Configure Backend Environment Variables

##### ✅ Configure BullMQ Module

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Set up BullMQ module in NestJS for asynchronous job processing.
- **Acceptance Criteria**:
  - [x] Install `@nestjs/bullmq` and `bullmq` packages
  - [x] Configure BullModule with Redis connection
  - [x] Create indexing queue configuration
  - [x] Set up queue processors structure
  - [x] Configure queue options (retry, backoff, timeout)
  - [x] Register BullModule in AppModule
  - [x] QueueModule created with indexing queue
- **Related**: [Tech Stack](./tech_stack.md), [Architecture Design](./architecture_design.md), [Data Ingestion Flow](./patterns/data_ingestion_flow.md)
- **Status**: Done
- **Dependencies**: Setup Redis Configuration

#### Phase 1.1.7: Development Infrastructure

##### ✅ Create Docker Compose Configuration

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Create Docker Compose file for local development with PostgreSQL and Redis services.
- **Acceptance Criteria**:
  - [x] Create `docker-compose.yml` in root directory
  - [x] Configure PostgreSQL 15+ service with:
    - Database name: `orchestr_ai`
    - Persistent volume for data
    - Environment variables for credentials
    - Port mapping (5432)
  - [x] Configure Redis service with:
    - Persistent volume for data
    - Port mapping (6379)
  - [x] Add health checks for both services
  - [x] Create network configuration
  - [x] Document usage in README (start, stop, reset commands)
- **Related**: [Tech Stack](./tech_stack.md), [Project Context](./project_context.md)
- **Status**: Done
- **Dependencies**: None

##### ✅ Create Environment Variable Templates

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Create `.env.example` files for backend and frontend with all required variables.
- **Acceptance Criteria**:
  - [x] Create `apps/backend/.env.example` with:
    - Database connection variables
    - Redis connection variables
    - Server port and host
    - Logging level
    - JWT secret (if applicable)
  - [x] Environment variables documented (backend template created)
  - [x] Document all variables with descriptions
  - [x] Include default values where appropriate
- **Related**: [Project Context](./project_context.md)
- **Status**: Done
- **Dependencies**: Configure Backend Environment Variables

##### ✅ Configure Development Scripts

- **Assignee**: [TBD]
- **Priority**: Medium
- **Description**: Set up npm/pnpm scripts in root and workspace package.json files for development workflows.
- **Acceptance Criteria**:
  - [x] Add scripts to root package.json:
    - `dev` - Start all apps in development mode
    - `dev:backend` - Start backend only
    - `dev:frontend` - Start frontend only
    - `build` - Build all apps
    - `test` - Run tests in all workspaces
    - `lint` - Lint all workspaces
    - `db:migrate` - Run database migrations
    - `db:migrate:generate` - Generate migration from entities
    - `db:migrate:revert` - Revert last migration
  - [x] Configure Turborepo pipelines for all scripts
  - [x] Docker scripts added (docker:up, docker:down, docker:logs, etc.)
  - [x] Document scripts in README
- **Related**: [Project Context](./project_context.md)
- **Status**: Done
- **Dependencies**: Initialize Turborepo Monorepo

#### Phase 1.1.8: Backend Core Features

##### ✅ Setup Structured Logging

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Configure structured JSON logging (Winston or Pino) with proper log levels and context.
- **Acceptance Criteria**:
  - [x] Install logging library (Winston or Pino)
  - [x] Create logger service/module
  - [x] Configure JSON format for logs
  - [x] Set up log levels (Error, Warn, Info, Debug) from environment
  - [x] Add request ID tracking middleware
  - [x] Configure log output (console, file)
  - [x] Add context logging (service name, file, line number)
  - [x] Integrate with NestJS logging system
- **Related**: [Tech Stack](./tech_stack.md), [Architecture Design](./architecture_design.md), [MVP Spec Phase 1.1](./specs/mvp_spec_phase_1.md)
- **Status**: Done
- **Dependencies**: Setup Backend Module Structure

##### ✅ Create Health Check Endpoint

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Create `/health` endpoint that returns service status including database and Redis connectivity.
- **Acceptance Criteria**:
  - [x] Install `@nestjs/terminus` package (recommended) or create custom endpoint
  - [x] Create health check controller
  - [x] Add database connectivity check
  - [x] Add Redis connectivity check
  - [x] Return status: `{ status: 'ok' | 'error', database: 'up' | 'down', redis: 'up' | 'down' }`
  - [x] Configure proper HTTP status codes (200 for healthy, 503 for unhealthy)
  - [x] Test health check endpoint
- **Related**: [Architecture Design](./architecture_design.md), [MVP Spec Phase 1.1](./specs/mvp_spec_phase_1.md)
- **Status**: Done
- **Dependencies**: Setup TypeORM and PostgreSQL Connection, Setup Redis Configuration

##### ✅ Configure API Rate Limiting

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Set up rate limiting for REST API endpoints using NestJS Throttler module.
- **Acceptance Criteria**:
  - [x] Install `@nestjs/throttler` package
  - [x] Configure ThrottlerModule with different limits for:
    - Indexing operations (low limit)
    - Graph visualization (high limit)
    - Contract editing (medium limit)
    - Default limit for other endpoints
  - [x] Apply throttler guards globally or per-controller
  - [x] Configure proper error responses (429 Too Many Requests)
  - [x] Add retry-after header in error responses
  - [x] Test rate limiting works correctly
- **Related**: [Architecture Design](./architecture_design.md), [Tech Stack](./tech_stack.md), [MVP Spec Phase 1.1](./specs/mvp_spec_phase_1.md)
- **Status**: Done
- **Dependencies**: Setup Backend Module Structure

##### ✅ Setup Basic Error Handling

- **Assignee**: [TBD]
- **Priority**: Medium
- **Description**: Implement global exception filter and error handling middleware for consistent error responses.
- **Acceptance Criteria**:
  - [x] Create global exception filter
  - [x] Handle common exceptions (ValidationException, NotFoundException, etc.)
  - [x] Format error responses consistently
  - [x] Include error context in logs
  - [x] Handle database errors gracefully
  - [x] Handle Redis/queue errors gracefully
  - [x] Return appropriate HTTP status codes
  - [x] Test error handling with various scenarios
- **Related**: [Architecture Design](./architecture_design.md)
- **Status**: Done
- **Dependencies**: Setup Structured Logging

#### Phase 1.1.9: Test Coverage and Quality Assurance

##### ✅ Configure Test Coverage Thresholds

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Set up test coverage thresholds and reporting for both backend and frontend applications.
- **Acceptance Criteria**:
  - [x] Configure Jest coverage thresholds in backend (minimum 70% for statements, branches, functions, lines)
  - [x] Configure Vitest coverage thresholds in frontend (minimum 70% for statements, branches, functions, lines)
  - [x] Set up coverage reporting format (HTML, JSON, LCOV)
  - [x] Configure coverage exclusions (test files, migrations, config files)
  - [x] Add coverage scripts to package.json files
  - [x] Document coverage requirements in README
- **Related**: [Tech Stack](./tech_stack.md)
- **Status**: Done
- **Dependencies**: None

##### ✅ Write Backend E2E Tests

- **Assignee**: [TBD]
- **Priority**: Medium
- **Description**: Create end-to-end tests for critical API workflows using test database.
- **Acceptance Criteria**:
  - [x] Set up E2E test database configuration
  - [x] Write E2E tests for system CRUD operations
  - [x] Write E2E tests for service CRUD operations with relationships
  - [x] Write E2E tests for contract CRUD operations and versioning
  - [x] Write E2E tests for indexing workflow (trigger → queue → processing → storage)
  - [x] Write E2E tests for health check endpoint
  - [x] Write E2E tests for error handling (404, 400, 500 responses)
  - [x] Write E2E tests for rate limiting
  - [x] Configure test database cleanup (beforeEach/afterEach hooks)
  - [x] Document E2E test setup and execution
- **Related**: [Architecture Design](./architecture_design.md), [Data Ingestion Flow](./patterns/data_ingestion_flow.md)
- **Status**: Done
- **Dependencies**: Configure Test Coverage Thresholds

##### ✅ Write Backend Integration Tests for Database

- **Assignee**: [TBD]
- **Priority**: Medium
- **Description**: Create integration tests for database operations and entity relationships.
- **Acceptance Criteria**:
  - [x] Write integration tests for System entity (CRUD, validation)
  - [x] Write integration tests for Service entity (CRUD, relationships with System)
  - [x] Write integration tests for Contract entity (CRUD, JSONB fields)
  - [x] Write integration tests for ContractVersion entity (versioning, snapshots)
  - [x] Write integration tests for ServiceContractUsage entity (many-to-many relationships)
  - [x] Test database migrations (up/down)
  - [x] Test entity relationships and cascading operations
  - [x] Test database indexes and constraints
  - [x] Use test database with proper cleanup
- **Related**: [Graph Storage Schema](./patterns/graph_storage_schema.md)
- **Status**: Done
- **Dependencies**: Configure Test Coverage Thresholds

##### ✅ Write Backend Integration Tests for Queue System

- **Assignee**: [TBD]
- **Priority**: Medium
- **Description**: Create integration tests for BullMQ queue operations and job processing.
- **Acceptance Criteria**:
  - [x] Write integration tests for queue job creation
  - [x] Write integration tests for queue job processing
  - [x] Write integration tests for queue job retry logic
  - [x] Write integration tests for queue job failure handling
  - [x] Test queue connection with Redis
  - [x] Test queue cleanup and job status tracking
  - [x] Use test Redis instance for isolation
- **Related**: [Architecture Design](./architecture_design.md), [Data Ingestion Flow](./patterns/data_ingestion_flow.md)
- **Status**: Done
- **Dependencies**: Configure Test Coverage Thresholds

##### ✅ Setup Test Utilities and Helpers

- **Assignee**: [TBD]
- **Priority**: Medium
- **Description**: Create reusable test utilities, mocks, and helpers for both backend and frontend.
- **Acceptance Criteria**:
  - [x] Create backend test utilities (database helpers, mock factories)
  - [x] Create frontend test utilities (render helpers, mock providers)
  - [x] Create shared test data factories (entities, DTOs)
  - [x] Create mock implementations for external services (Redis, queues)
  - [x] Create API mock server setup (MSW or similar for frontend)
  - [x] Document test utilities usage
  - [x] Add examples in test files
- **Related**: [Tech Stack](./tech_stack.md)
- **Status**: Done
- **Dependencies**: None

### Active Tasks

#### Phase 1.2.1: Git Integration

##### ✅ Setup Git Repository Cloning Service

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Create service for cloning Git repositories with authentication support and temporary directory management.
- **Acceptance Criteria**:
  - [x] Install Git client library (simple-git or nodegit)
  - [x] Create GitService for repository cloning
  - [x] Support authentication (SSH keys, HTTPS with tokens)
  - [x] Implement temporary directory management
  - [x] Add cleanup mechanism for temporary files
  - [x] Error handling for cloning failures (invalid URL, authentication errors, network issues)
  - [x] Support for different Git providers (GitHub, GitLab, Bitbucket)
  - [x] Logging for cloning operations
- **Related**: [MVP Spec Phase 1.2](./specs/mvp_spec_phase_1.md), [Data Ingestion Flow](./patterns/data_ingestion_flow.md)
- **Status**: Done
- **Dependencies**: Setup Structured Logging

#### Phase 1.2.2: Spring Boot Contract Extraction

##### ✅ Implement Spring Boot Annotation Parser

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Parse Spring Boot annotations to extract REST API contracts from controllers.
- **Acceptance Criteria**:
  - [x] Install Java/Spring Boot parser library (JavaParser or similar)
  - [x] Parse @RestController and @Controller annotations
  - [x] Extract HTTP methods from @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping
  - [x] Extract request paths from @RequestMapping and method-level annotations
  - [x] Parse @PathVariable, @RequestParam, @RequestBody annotations
  - [x] Extract request/response DTOs and generate JSON schemas
  - [x] Handle nested DTOs and complex types
  - [x] Support for @RequestHeader and @CookieValue
  - [x] Error logging with file and line number references
  - [x] Partial extraction on parse errors (continue with valid contracts)
- **Related**: [MVP Spec Phase 1.2](./specs/mvp_spec_phase_1.md), [API Extraction Guide](./guides/api_extraction_guide.md)
- **Status**: Done
- **Dependencies**: Setup Git Repository Cloning Service

#### Phase 1.2.3: OpenAPI/Swagger Parser

##### 🟢 Implement OpenAPI/Swagger File Parser

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Parse OpenAPI/Swagger specification files to extract API contracts.
- **Acceptance Criteria**:
  - [ ] Install OpenAPI parser library (swagger-parser or openapi-types)
  - [ ] Support OpenAPI 3.0 and 3.1 specifications
  - [ ] Support Swagger 2.0 specifications
  - [ ] Extract paths, methods, parameters, request/response schemas
  - [ ] Handle $ref references in OpenAPI specs
  - [ ] Merge with annotation-based extraction (prioritize OpenAPI if both exist)
  - [ ] Support for multiple OpenAPI files in repository
  - [ ] Error handling for invalid/malformed OpenAPI files
  - [ ] Logging for parsing operations
- **Related**: [MVP Spec Phase 1.2](./specs/mvp_spec_phase_1.md), [API Extraction Guide](./guides/api_extraction_guide.md)
- **Status**: Ready
- **Dependencies**: Setup Git Repository Cloning Service

#### Phase 1.2.4: Dependency Detection

##### 🟢 Analyze HTTP Clients for Dependency Detection

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Detect dependencies between services by analyzing HTTP client usage in code.
- **Acceptance Criteria**:
  - [ ] Parse RestTemplate usage and extract service URLs
  - [ ] Parse WebClient usage and extract service URLs
  - [ ] Parse FeignClient annotations and extract service names
  - [ ] Extract HTTP method and path from client calls
  - [ ] Match client calls to contracts in database
  - [ ] Confidence scoring based on detection method
  - [ ] Store detection method and confidence in ServiceContractUsage entity
- **Related**: [MVP Spec Phase 1.2](./specs/mvp_spec_phase_1.md), [Contract Analysis Rules](./patterns/contract_analysis_rules.md)
- **Status**: Ready
- **Dependencies**: Implement Spring Boot Annotation Parser

##### 🟢 Parse Service Discovery Configuration

- **Assignee**: [TBD]
- **Priority**: Medium
- **Description**: Parse service discovery configuration files to identify service names and URLs.
- **Acceptance Criteria**:
  - [ ] Parse Eureka configuration (application.yml, application.properties)
  - [ ] Parse Consul configuration
  - [ ] Extract service names and base URLs
  - [ ] Map service names to Service entities in database
  - [ ] Use service discovery info for dependency matching
  - [ ] Confidence scoring for service discovery-based detection
- **Related**: [MVP Spec Phase 1.2](./specs/mvp_spec_phase_1.md), [Contract Analysis Rules](./patterns/contract_analysis_rules.md)
- **Status**: Ready
- **Dependencies**: Implement Spring Boot Annotation Parser

##### 🟢 Implement URL Pattern Matching

- **Assignee**: [TBD]
- **Priority**: Medium
- **Description**: Match HTTP client URLs to contracts using pattern matching.
- **Acceptance Criteria**:
  - [ ] Extract URLs from HTTP client calls
  - [ ] Normalize URLs (remove query params, handle path variables)
  - [ ] Match URLs to contract paths using pattern matching
  - [ ] Handle path variables and wildcards
  - [ ] Confidence scoring for URL-based matching
  - [ ] Store matches in ServiceContractUsage entity
- **Related**: [MVP Spec Phase 1.2](./specs/mvp_spec_phase_1.md), [Contract Analysis Rules](./patterns/contract_analysis_rules.md)
- **Status**: Ready
- **Dependencies**: Analyze HTTP Clients for Dependency Detection

#### Phase 1.2.5: Indexing Queue Processing

##### 🟢 Implement BullMQ Job Processor for Indexing

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Create BullMQ job processor to handle asynchronous repository indexing.
- **Acceptance Criteria**:
  - [ ] Create IndexingProcessor class with @Processor decorator
  - [ ] Implement job processing logic:
    - Clone repository
    - Extract contracts using Spring Boot parser
    - Extract contracts using OpenAPI parser
    - Detect dependencies
    - Save contracts and dependencies to database
  - [ ] Update Service indexing_status during processing
  - [ ] Handle job failures with proper error logging
  - [ ] Cleanup temporary files after processing
  - [ ] Support for job retry mechanism
  - [ ] Progress tracking for long-running jobs
- **Related**: [MVP Spec Phase 1.2](./specs/mvp_spec_phase_1.md), [Data Ingestion Flow](./patterns/data_ingestion_flow.md)
- **Status**: Ready
- **Dependencies**: Setup Git Repository Cloning Service, Implement Spring Boot Annotation Parser, Implement OpenAPI/Swagger File Parser, Analyze HTTP Clients for Dependency Detection

##### 🟢 Implement Indexing Status Tracking

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Track indexing status for services throughout the indexing process.
- **Acceptance Criteria**:
  - [ ] Update Service.indexing_status to PENDING when job is queued
  - [ ] Update to IN_PROGRESS when job starts processing
  - [ ] Update to COMPLETED when job succeeds
  - [ ] Update to FAILED when job fails
  - [ ] Update Service.last_indexed_at timestamp
  - [ ] Store error messages in Service.metadata on failure
  - [ ] Provide status query endpoints
- **Related**: [MVP Spec Phase 1.2](./specs/mvp_spec_phase_1.md), [Graph Storage Schema](./patterns/graph_storage_schema.md)
- **Status**: Ready
- **Dependencies**: Implement BullMQ Job Processor for Indexing

##### 🟢 Implement Job Retry and Error Handling

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Configure retry mechanism for failed indexing jobs with proper error handling.
- **Acceptance Criteria**:
  - [ ] Configure BullMQ retry options (max attempts, backoff strategy)
  - [ ] Different retry strategies for different error types
  - [ ] Log all errors with full context (service ID, repository URL, error details)
  - [ ] Store error information in job data
  - [ ] Handle transient errors (network issues) vs permanent errors (invalid repository)
  - [ ] Implement exponential backoff for retries
  - [ ] Set maximum retry attempts
  - [ ] Mark job as failed after max retries
- **Related**: [MVP Spec Phase 1.2](./specs/mvp_spec_phase_1.md), [Data Ingestion Flow](./patterns/data_ingestion_flow.md)
- **Status**: Ready
- **Dependencies**: Implement BullMQ Job Processor for Indexing

##### 🟢 Implement Parallel Processing Support

- **Assignee**: [TBD]
- **Priority**: Medium
- **Description**: Support parallel processing of multiple services for efficient indexing.
- **Acceptance Criteria**:
  - [ ] Configure BullMQ concurrency settings
  - [ ] Process multiple services in parallel
  - [ ] Limit concurrent jobs to prevent resource exhaustion
  - [ ] Monitor queue length and processing time
  - [ ] Handle queue backpressure
  - [ ] Support for priority queues (high priority for manual triggers)
- **Related**: [MVP Spec Phase 1.2](./specs/mvp_spec_phase_1.md), [Data Ingestion Flow](./patterns/data_ingestion_flow.md)
- **Status**: Ready
- **Dependencies**: Implement BullMQ Job Processor for Indexing

#### Phase 1.2.6: Indexing API

##### 🟢 Create Indexing Trigger Endpoints

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Create REST API endpoints for triggering indexing operations.
- **Acceptance Criteria**:
  - [ ] POST /api/indexer/services/:serviceId/trigger - Trigger indexing for a service
  - [ ] POST /api/indexer/systems/:systemId/trigger - Trigger indexing for all services in a system
  - [ ] Validate service/system exists before queuing
  - [ ] Return job ID and status immediately
  - [ ] Apply rate limiting to indexing endpoints
  - [ ] Error handling for invalid requests
- **Related**: [MVP Spec Phase 1.2](./specs/mvp_spec_phase_1.md), [Architecture Design](./architecture_design.md)
- **Status**: Ready
- **Dependencies**: Implement BullMQ Job Processor for Indexing

##### 🟢 Create Indexing Status Endpoints

- **Assignee**: [TBD]
- **Priority**: High
- **Description**: Create API endpoints for checking indexing status and job information.
- **Acceptance Criteria**:
  - [ ] GET /api/indexer/services/:serviceId/status - Get indexing status for a service
  - [ ] GET /api/indexer/jobs/:jobId - Get job details by ID
  - [ ] GET /api/indexer/jobs - List recent indexing jobs
  - [ ] Return indexing status, progress, error messages
  - [ ] Include job metadata (start time, duration, etc.)
  - [ ] Support filtering and pagination for job list
- **Related**: [MVP Spec Phase 1.2](./specs/mvp_spec_phase_1.md), [Architecture Design](./architecture_design.md)
- **Status**: Ready
- **Dependencies**: Implement Indexing Status Tracking

##### 🟢 Create Indexing Management Endpoints

- **Assignee**: [TBD]
- **Priority**: Medium
- **Description**: Create API endpoints for managing indexing jobs (cancel, retry, etc.).
- **Acceptance Criteria**:
  - [ ] DELETE /api/indexer/jobs/:jobId - Cancel a running job
  - [ ] POST /api/indexer/jobs/:jobId/retry - Retry a failed job
  - [ ] GET /api/indexer/queue/stats - Get queue statistics
  - [ ] Validate job state before operations
  - [ ] Error handling for invalid operations
  - [ ] Logging for management operations
- **Related**: [MVP Spec Phase 1.2](./specs/mvp_spec_phase_1.md), [Architecture Design](./architecture_design.md)
- **Status**: Ready
- **Dependencies**: Implement BullMQ Job Processor for Indexing

### Blocked Tasks

_No blocked tasks at this time._

### Completed This Sprint

_No completed tasks yet._

## Backlog

### Phase 1.3: Visualization and UI

_These tasks will be added after Phase 1.2 is complete. See [MVP Spec Phase 1.3](./specs/mvp_spec_phase_1.md) for details._

### Phase 1.4: Versioning and Change Analysis

_These tasks will be added after Phase 1.3 is complete. See [MVP Spec Phase 1.4](./specs/mvp_spec_phase_1.md) for details._

## Technical Debt

- **Future enhancements** - See [MVP Spec](./specs/mvp_spec_phase_1.md) Technical Debt section for known limitations

## Related Documentation

- [MVP Spec Phase 1](./specs/mvp_spec_phase_1.md) - Phase 1 requirements
- [Workflows](./workflows/) - Process documentation
- [Architecture Design](./architecture_design.md) - System context
- [Tech Stack](./tech_stack.md) - Technology choices
- [Project Context](./project_context.md) - Quick onboarding guide
- [Graph Storage Schema](./patterns/graph_storage_schema.md) - Database schema details

---

_Update this file regularly to reflect current project status_
