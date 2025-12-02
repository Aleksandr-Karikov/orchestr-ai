# Data Ingestion Flow Pattern

## Overview

The microservice indexing process consists of several stages: cloning repositories, scanning code, extracting contracts, validation, and saving to the database. Each stage can be executed asynchronously to improve performance.

## Flow Diagram

```
Git Repository → Clone → Scan Files → Extract Contracts → Validate → Store in DB → Create Version
     ↓              ↓          ↓              ↓              ↓            ↓              ↓
  [URL]      [Local FS]  [File List]   [Contracts]    [Validated]  [Graph DB]   [Version History]
     ↓
  [BullMQ Queue] - Asynchronous processing
     ↓
  [Static Analysis] → [LLM Enhancement (Future)] → [Merge Results]
```

**Future LLM Integration Flow**:

```
Static Analysis (Primary)
    ↓ (if incomplete/failed)
LLM Analysis (Enhancement)
    ↓
Cache LLM Results (Redis)
    ↓
Merge with Static Results
    ↓
Validate & Store
```

## Components

### 1. Source

- **Purpose**: Obtaining microservice source code
- **Types**:
  - Git repositories (GitHub, GitLab, Bitbucket)
  - Local paths (for development)
- **Implementation**:
  - Using `simple-git` for cloning
  - Temporary storage in file system
  - Cleanup after processing
  - TTL-based cleanup: Remove repositories not accessed for N days (configurable)
  - Jobs queued via BullMQ for asynchronous processing
  - **Future**: Incremental updates using `git pull` instead of full clone

### 2. Processor

- **Purpose**: Scanning and analyzing code to find contracts
- **Processing Steps**:
  1. **File Discovery**: Finding controllers by configuration or standard paths
     - Spring Boot: `**/controller/**/*.java`, `**/Controller.java`
     - OpenAPI files: `**/openapi.yaml`, `**/swagger.json`
  2. **Code Parsing**: Parsing Java code to extract annotations
     - `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`, etc.
  3. **OpenAPI Parsing**: Parsing OpenAPI/Swagger specifications if available
  4. **Contract Extraction**: Forming structured contracts
     - HTTP method, path, parameters, request/response schemas
  5. **LLM Enhancement** (Future): AI-powered extraction for complex cases
     - Fallback when static analysis fails or is incomplete
     - Semantic understanding of undocumented code
     - Enhanced dependency detection from code context
     - Results cached to reduce API costs

### 3. Validator

- **Purpose**: Validating correctness of extracted contracts
- **Validation Rules**:
  - Contract must have HTTP method and path
  - JSON schemas must be valid
  - Parameters must have types
  - Duplicate contract check

### 4. Storage

- **Purpose**: Saving contracts and building dependency graph
- **Schema**: See [Graph Storage Schema](./graph_storage_schema.md)
- **Process**:
  - Saving services to `services` table
  - Saving contracts to `contracts` table with JSON schemas
  - Creating initial contract version in `contract_versions` table
  - Building relationships between services based on dependency detection
  - Storing dependency information in `service_contract_usage` with confidence scores

## Error Handling

- **Clone Failures**: Logging error, marking service as unavailable
- **Parse Errors**: Partial extraction (what succeeded), logging problematic files
- **Validation Errors**: Skipping invalid contracts with user notification
- **Storage Errors**: Retry mechanism, transactional integrity

## Performance Considerations

- **Parallel Processing**: Multiple services processed simultaneously via BullMQ workers
- **Queue Management**: BullMQ handles job distribution, retries, and failure handling
- **Caching**: Caching parsing results for unchanged files (future: Redis caching)
- **LLM Caching** (Future): Cache LLM responses to reduce API costs and latency
- **LLM Rate Limiting** (Future): Throttle LLM API calls to manage quotas and costs
- **Incremental Indexing**: Updating only changed files (future enhancement)
- **Asynchronous Tasks**: All indexing operations run asynchronously via BullMQ queues
- **Version Management**: Only create new versions when contracts actually change
- **Hybrid Approach** (Future): Static analysis first, LLM only when needed (fallback/enhancement)

## Disk Space Management

### Strategy (MVP)

- **TTL-based Cleanup**: Automatically remove cloned repositories after N days of inactivity (default: 7 days, configurable)
- **Immediate Cleanup**: Remove repository directory after successful indexing (if not needed for incremental updates)
- **Scheduled Cleanup**: Periodic cleanup job via BullMQ scheduled tasks to remove expired repositories
- **Disk Monitoring**: Track disk space usage and alert when approaching limits

### Future Enhancements

- **Incremental Updates**: Use `git pull` instead of full clone for repositories that already exist
- **Selective Cloning**: Only clone specific branches/tags instead of full repository
- **Compression**: Compress old repository clones before deletion

## Related Documentation

- [Architecture Design](../architecture_design.md) - Overall system context
- [Graph Storage Schema](./graph_storage_schema.md) - Storage details
- [Contract Analysis Rules](./contract_analysis_rules.md) - Analysis patterns

---

_Part of the [Patterns](../README.md#-patterns) collection_
