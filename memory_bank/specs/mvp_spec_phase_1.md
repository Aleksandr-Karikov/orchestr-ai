# MVP Specification - Phase 1

## Overview

MVP 1.0 focuses on basic functionality for Spring Boot microservices with REST API. Key capabilities: system creation, repository indexing, semi-automatic contract extraction, basic dependency graph visualization, manual contract editing, and simple change analysis.

## Requirements

### Functional Requirements

#### FR1: System and Service Management

- **Description**: User can create systems and add microservices with Git repository URLs
- **Priority**: Must Have
- **Acceptance Criteria**:
  - [ ] CRUD operations for systems
  - [ ] Add/remove services to/from system
  - [ ] Repository URL validation
  - [ ] Display list of systems and services in UI

#### FR2: Repository Indexing

- **Description**: System clones repositories and scans code to find contracts
- **Priority**: Must Have
- **Acceptance Criteria**:
  - [ ] Git repository cloning
  - [ ] Asynchronous indexing processing using BullMQ queues
  - [ ] Indexing status tracking (pending, in_progress, completed, failed)
  - [ ] Job retry mechanism for failed indexing
  - [ ] Parallel processing of multiple services
  - [ ] Cleanup of temporary files after processing
  - [ ] Error handling and logging for indexing failures

#### FR3: Contract Extraction (Semi-automatic)

- **Description**: Extracting REST API contracts from Spring Boot code
- **Priority**: Must Have
- **Acceptance Criteria**:
  - [ ] Parsing Spring Boot annotations (@RestController, @GetMapping, etc.)
  - [ ] Parsing OpenAPI/Swagger files if available
  - [ ] Support for configuration files to specify controller paths
  - [ ] Extracting HTTP methods, paths, parameters
  - [ ] Generating JSON schemas for requests/responses from DTO classes
  - [ ] Partial extraction on parse errors (continue with valid contracts)
  - [ ] Error logging with file and line number references

#### FR3.1: Dependency Detection

- **Description**: Automatic detection of dependencies between services
- **Priority**: Must Have
- **Acceptance Criteria**:
  - [ ] Analysis of HTTP clients (RestTemplate, WebClient, FeignClient)
  - [ ] Service discovery configuration parsing (Eureka, Consul)
  - [ ] URL pattern matching for service identification
  - [ ] Manual dependency specification in UI
  - [ ] Confidence scoring for automatic detection
  - [ ] Storage of detection method and confidence in ServiceContractUsage

#### FR4: Dependency Graph Visualization

- **Description**: Interactive graph showing connections between services
- **Priority**: Must Have
- **Acceptance Criteria**:
  - [ ] Display services as graph nodes
  - [ ] Display dependencies as edges
  - [ ] Interactivity (zoom, pan, node selection)
  - [ ] Contract information on edge click

#### FR5: Manual Contract Editing

- **Description**: User can edit extracted contracts in UI
- **Priority**: Must Have
- **Acceptance Criteria**:
  - [ ] Edit contract fields (method, path, parameters)
  - [ ] Edit request/response JSON schemas
  - [ ] Validate changes
  - [ ] Save changes to database

#### FR6: Contract Versioning

- **Description**: Version history for contracts to enable change analysis
- **Priority**: Must Have
- **Acceptance Criteria**:
  - [ ] Automatic version creation when contract is updated
  - [ ] Version history storage in ContractVersion table
  - [ ] Ability to view version history in UI
  - [ ] Current version tracking

#### FR7: Contract Change Analysis

- **Description**: Comparing contract versions and identifying affected services
- **Priority**: Must Have
- **Acceptance Criteria**:
  - [ ] JSON schema comparison (old vs new version)
  - [ ] Breaking change detection with severity levels (high/medium/low)
  - [ ] Detailed change classification (method, path, parameter, schema changes)
  - [ ] List of services using the changed contract
  - [ ] Impact analysis with confidence scores
  - [ ] Visual highlighting of affected services in graph
  - [ ] Change report generation

### Non-Functional Requirements

#### NFR1: Indexing Performance

- **Description**: Indexing should complete in reasonable time
- **Metrics**:
  - Single service indexing: < 2 minutes
  - System with 10 services indexing: < 10 minutes (in parallel)

#### NFR2: Reliability

- **Description**: System should handle errors correctly
- **Metrics**:
  - Handle repository cloning errors
  - Partial contract extraction on parsing errors
  - Structured logging for all errors with full context
  - Health check endpoint available for monitoring
  - Error recovery with retry mechanisms

#### NFR4: Logging and Monitoring

- **Description**: Basic observability for debugging and monitoring
- **Metrics**:
  - Structured JSON logging with context (request IDs, service names)
  - Health check endpoint (`/health`) returning service status
  - Basic metrics: indexing success rates, error counts
  - Logging of all errors with stack traces and context

#### NFR5: API Protection

- **Description**: Rate limiting to prevent API abuse
- **Metrics**:
  - Rate limiting configured for all REST API endpoints
  - Different limits for different operation types (indexing, visualization, editing)
  - Proper error responses (429) when limits exceeded

#### NFR3: Scalability

- **Description**: Support for systems with many services
- **Metrics**:
  - Support systems with 50+ services
  - Visualize graphs with 100+ nodes without performance degradation

## Architecture Alignment

This phase implements:

- Repository Indexer Service (see [Architecture Design](../architecture_design.md))
- Contract Extractor Service
- Graph Builder Service
- Change Analyzer Service
- Visualization Engine
- System Management API
- Data Ingestion Flow (see [Data Ingestion Flow](../patterns/data_ingestion_flow.md))
- Graph Storage Schema (see [Graph Storage Schema](../patterns/graph_storage_schema.md))
- Tech Stack: NestJS, React, PostgreSQL, TypeORM (see [Tech Stack](../tech_stack.md))

## Implementation Plan

### Phase 1.1: Basic Infrastructure

- **Duration**: 2-3 weeks
- **Tasks**: See [Current Tasks](../current_tasks.md)
- **Deliverables**:
  - Monorepo setup (Turborepo)
  - Basic backend (NestJS) and frontend (React) structure
  - PostgreSQL and TypeORM setup
  - Redis and BullMQ setup for job queues
  - Database migrations for tables (System, Service, Contract, ContractVersion, ServiceContractUsage)
  - GIN indexes for JSONB fields
  - Structured logging setup
  - Health check endpoint
  - API rate limiting configuration

### Phase 1.2: Indexing and Contract Extraction

- **Duration**: 3-4 weeks
- **Tasks**: See [Current Tasks](../current_tasks.md)
- **Deliverables**:
  - Git integration (repository cloning)
  - Spring Boot annotation parser
  - OpenAPI/Swagger file parser
  - Dependency detection (HTTP clients, config files, URL matching)
  - BullMQ job processors for asynchronous indexing
  - API for indexing management
  - Error handling and partial extraction support

### Phase 1.3: Visualization and UI

- **Duration**: 2-3 weeks
- **Tasks**: See [Current Tasks](../current_tasks.md)
- **Deliverables**:
  - UI for system and service management
  - Graph visualization component (react-flow or vis-network)
  - UI for contract editing

### Phase 1.4: Versioning and Change Analysis

- **Duration**: 2-3 weeks
- **Tasks**: See [Current Tasks](../current_tasks.md)
- **Deliverables**:
  - Contract versioning system (ContractVersion table)
  - Automatic version creation on contract updates
  - JSON schema comparison service
  - Breaking change detection with detailed rules
  - Change classification (method, path, parameter, schema)
  - Impact analysis with affected services
  - Change report generation
  - Affected services visualization in graph

## Technical Debt

Known technical debt items for this phase:

- **Limited language support**: Only Spring Boot/Java. Adding other languages in future versions
- **Basic dependency detection**: Multiple methods implemented (HTTP clients, config, URL matching) but may need refinement for complex cases
- **Contract versioning**: Basic versioning implemented. Advanced features (version comparison UI, rollback) in future
- **No vector databases**: Semantic code search not implemented. Can be added later
- **Graph caching**: In-memory caching implemented for MVP, Redis caching for distributed systems in future
- **Authentication**: Basic JWT mentioned but not fully scoped for MVP
- **Disk space management**: Basic TTL-based cleanup, incremental updates in future

## Out of Scope

The following are explicitly out of scope for Phase 1:

- **LLM contract extraction**: Only static code analysis in MVP. LLM integration planned for Phase 2+ with:
  - AI-powered extraction for complex/undocumented code
  - Semantic dependency detection
  - Natural language documentation generation
  - Hybrid approach: static analysis first, LLM as enhancement/fallback
  - LLM result caching and rate limiting
- **GraphQL/gRPC**: Only REST API
- **Automatic dependency detection**: Basic support implemented, LLM enhancement in future
- **Vector databases**: For semantic code search (may be needed for LLM context management)
- **Authentication/authorization**: Basic version without access control
- **CI/CD integration**: Automatic indexing on repository changes

## Success Criteria

Phase 1 is considered complete when:

- [ ] User can create a system and add 10 Spring Boot microservices
- [ ] System successfully indexes all repositories and extracts contracts (asynchronously via BullMQ)
- [ ] Dependencies between services are automatically detected with confidence scores
- [ ] Dependency graph visualizes correctly with all connections
- [ ] User can edit contracts in UI
- [ ] Contract versions are automatically created on updates
- [ ] Version history is accessible in UI
- [ ] Change analysis correctly identifies breaking changes with severity levels
- [ ] Affected services are correctly identified and visualized
- [ ] Change reports are generated with detailed breakdown

## Related Documentation

- [Architecture Design](../architecture_design.md) - System design
- [Current Tasks](../current_tasks.md) - Active work items
- [Product Brief](../product_brief.md) - Business context
- [Tech Stack](../tech_stack.md) - Technology constraints

---

_This is a living document. Update as Phase 1 evolves._
