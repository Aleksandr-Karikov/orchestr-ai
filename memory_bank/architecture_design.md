# Architecture Design

## Overview

Orchestr-AI is built as a monorepo (Turborepo) with separation into backend (NestJS) and frontend (React). The backend handles repository indexing, contract extraction, data storage, and analysis. The frontend provides UI for system management, graph visualization, and contract editing. Shared types and utilities are extracted into shared packages for reuse between applications.

## System Components

### Core Components

1. **Repository Indexer Service**

   - Purpose: Scans microservice repositories, clones code, indexes files
   - Related: [Data Ingestion Flow](./patterns/data_ingestion_flow.md), [API Extraction Guide](./guides/api_extraction_guide.md)

2. **Contract Extractor Service**

   - Purpose: Extracts contracts from code (Spring Boot annotations, OpenAPI files)
   - Features: Dependency detection (HTTP clients, config files, URL matching)
   - Architecture: Strategy pattern for multiple extraction methods (static analysis, LLM-based)
   - Related: [Contract Analysis Rules](./patterns/contract_analysis_rules.md), [API Extraction Guide](./guides/api_extraction_guide.md)

2.1. **LLM Analysis Service** (Future)

- Purpose: AI-powered contract extraction and analysis using Large Language Models
- Features:
  - Semantic code understanding for complex cases
  - Extraction from undocumented or poorly annotated code
  - Intelligent dependency detection from code context
  - Natural language contract documentation generation
- Integration: Works alongside static analysis as fallback/enhancement
- Related: [Data Ingestion Flow](./patterns/data_ingestion_flow.md), [Tech Stack](./tech_stack.md)

3. **Graph Builder Service**

   - Purpose: Builds dependency graph between services based on contracts
   - Features: In-memory caching for graph data to improve visualization performance
   - Related: [Graph Storage Schema](./patterns/graph_storage_schema.md), [Visualization Engine](./guides/visualization_engine.md)

4. **Change Analyzer Service**

   - Purpose: Analyzes contract changes and identifies affected services
   - Features: Version comparison, breaking change detection with severity levels, impact analysis
   - Related: [Breaking Change Check](./workflows/breaking_change_check.md), [Contract Analysis Rules](./patterns/contract_analysis_rules.md)

5. **Version Management Service**

   - Purpose: Manages contract version history and version creation
   - Features: Automatic version creation on contract updates, version comparison
   - Related: [Graph Storage Schema](./patterns/graph_storage_schema.md)

6. **Visualization Engine**

   - Purpose: Renders interactive dependency graph in the browser
   - Related: [Visualization Engine Guide](./guides/visualization_engine.md)

7. **System Management API**

   - Purpose: CRUD operations for systems, services, contracts
   - Related: [Graph Storage Schema](./patterns/graph_storage_schema.md)

8. **Job Queue Service (BullMQ)**

   - Purpose: Manages asynchronous tasks for repository indexing and contract extraction
   - Features: Job queuing, retry logic, parallel processing
   - Related: [Data Ingestion Flow](./patterns/data_ingestion_flow.md), [Tech Stack](./tech_stack.md)

9. **Logging and Monitoring Service**

   - Purpose: Structured logging and basic monitoring capabilities
   - Features: Request tracking, error logging with context, basic metrics
   - Health checks: `/health` endpoint for service status monitoring
   - Related: [Tech Stack](./tech_stack.md)

### Data Flow

See [Data Ingestion Flow](./patterns/data_ingestion_flow.md) for detailed flow diagrams.

## Architecture Patterns

### Key Patterns

- **Repository Pattern**: Encapsulation of PostgreSQL work through TypeORM
- **Service Layer Pattern**: Business logic in services, controllers only for HTTP
- **Graph Data Model**: Storing dependencies as a graph (see [Graph Storage Schema](./patterns/graph_storage_schema.md))
- **Extraction Pipeline**: Multi-stage contract extraction (see [Data Ingestion Flow](./patterns/data_ingestion_flow.md))

## Data Architecture

### Storage

- **PostgreSQL**: Primary relational database for storing systems, services, contracts, contract versions
  - Schema: See [Graph Storage Schema](./patterns/graph_storage_schema.md)
  - GIN indexes for JSONB fields for efficient schema queries
- **Redis**: Queue system (BullMQ) and caching layer
  - Job queues for asynchronous indexing
  - Graph caching (future enhancement)
- **File System**: Temporary storage of cloned repositories
  - TTL-based cleanup for old repositories
  - Incremental updates (future enhancement)
  - **Future: Vector DB**: For semantic code search (not in MVP)

### Data Processing

- See [Data Ingestion Flow](./patterns/data_ingestion_flow.md)
- Contracts are stored as JSON schemas for comparison

## Integration Points

1. **Git Integration**: Cloning and scanning repositories
2. **Static Analysis**: Parsing Java/Spring Boot code to extract annotations
3. **OpenAPI Parser**: Parsing OpenAPI/Swagger specifications
4. **LLM APIs** (Future): Integration with OpenAI, Anthropic, or local models for AI-powered analysis
5. **Frontend-Backend**: REST API for all operations

## Scalability Considerations

- Repository indexing performed asynchronously via BullMQ task queues
- Parallel processing of multiple services with worker pools
- In-memory graph caching for MVP (Redis caching for distributed systems in future)
- Rate limiting for REST API endpoints to prevent abuse
- LLM result caching to reduce API costs and improve performance (future)
- Rate limiting for LLM API calls to manage costs and quotas (future)
- Ability to scale horizontally through Docker/Kubernetes
- GIN indexes on JSONB fields for efficient schema queries
- Version history stored separately to avoid bloating main contract table
- Fallback mechanisms: Static analysis as primary, LLM as enhancement/fallback

## Error Handling Strategy

### Error Categories

1. **Repository Access Errors**:

   - Clone failures (network, authentication, permissions)
   - **Handling**: Mark service as `indexing_status = failed`, log error, allow retry
   - **User Action**: Provide error message in UI, allow manual retry

2. **Code Parsing Errors**:

   - Syntax errors in source code
   - Unsupported language features
   - **Handling**: Partial extraction (continue with valid contracts), log problematic files with line numbers
   - **User Action**: Show warnings in UI, allow manual contract editing

3. **Contract Validation Errors**:

   - Invalid JSON schemas
   - Missing required fields
   - **Handling**: Skip invalid contracts, log validation errors
   - **User Action**: Show validation errors in UI, allow manual correction

4. **Database Errors**:

   - Connection failures
   - Transaction conflicts
   - **Handling**: Retry with exponential backoff, rollback on failure
   - **User Action**: Show error message, allow retry

5. **LLM API Errors** (Future):
   - Rate limiting
   - API failures
   - Invalid responses
   - **Handling**: Fallback to static analysis, retry with backoff, cache failures
   - **User Action**: Show warning, allow manual extraction

### Error Recovery

- **Retry Strategy**: Exponential backoff for transient errors (network, API)
- **Partial Success**: Continue processing when possible (extract valid contracts, skip invalid)
- **Error Logging**: Structured logging with context (service, file, line number, error type)
- **User Feedback**: Clear error messages in UI with actionable steps

## Logging and Monitoring

### Logging Strategy (MVP)

- **Structured Logging**: JSON format logs for easy parsing and analysis
- **Log Levels**: Error, Warn, Info, Debug (configurable per environment)
- **Context Tracking**: Request IDs for tracing operations across services
- **Error Logging**: Full context including stack traces, service name, file paths, line numbers
- **Performance Logging**: Indexing duration, contract extraction time, query performance

### Monitoring (MVP)

- **Health Checks**: `/health` endpoint returning service status (database, Redis connectivity)
- **Basic Metrics**: Indexing success/failure rates, contract extraction counts, error rates
- **Alerting**: Basic alerts for critical errors and service unavailability

**Future Enhancements**: Prometheus metrics, Grafana dashboards, distributed tracing

## API Rate Limiting

- **Purpose**: Protect API endpoints from abuse and ensure fair resource usage
- **Strategy**: Different limits for different operation types
  - Indexing operations: Low limit (expensive, resource-intensive)
  - Graph visualization: High limit (read-only, lightweight)
  - Contract editing: Medium limit (write operations)
- **Implementation**: NestJS Throttler module with configurable limits per endpoint
- **Error Response**: 429 Too Many Requests with retry-after header

## Security Architecture

- User authentication (JWT tokens)
- Authorization for system access
- Secure storage of credentials for repository access (encrypted in database)
  - GitHub/GitLab tokens stored encrypted
  - Credentials decrypted only when needed for repository access
- Input validation (file paths, repository URLs)
- HTTPS for all API communications
- Rate limiting to prevent abuse (see API Rate Limiting section)

## Related Documentation

- [Tech Stack](./tech_stack.md) - Technology implementation details
- [Product Brief](./product_brief.md) - Why we're building this
- [Patterns](./patterns/) - Detailed architectural patterns
- [Guides](./guides/) - Implementation guides

---

_For specific implementation guides, see [Guides](./guides/)_
