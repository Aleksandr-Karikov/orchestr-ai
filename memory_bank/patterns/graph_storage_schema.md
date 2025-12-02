# Graph Storage Schema

## Overview

The dependency graph is modeled in PostgreSQL through relational tables with JSON field support for storing contract schemas. Although this is not a native graph database, the structure allows efficient representation and querying of relationships between services.

## Node Types

### System

- **Properties**:
  - `id`: UUID - Unique identifier
  - `name`: VARCHAR - System name
  - `description`: TEXT - Description
  - `created_at`: TIMESTAMP - Creation date
  - `updated_at`: TIMESTAMP - Update date
- **Relationships**:
  - `HAS_SERVICE` → Service (one-to-many)

### Service

- **Properties**:
  - `id`: UUID - Unique identifier
  - `system_id`: UUID (FK) - Reference to system
  - `name`: VARCHAR - Service name
  - `repository_url`: VARCHAR - Git repository URL
  - `repository_path`: VARCHAR - Local path (temporary)
  - `last_indexed_at`: TIMESTAMP - Last indexing time
  - `indexing_status`: ENUM - Indexing status (pending, in_progress, completed, failed)
  - `metadata`: JSONB - Additional metadata
- **Relationships**:
  - `BELONGS_TO` → System (many-to-one)
  - `HAS_CONTRACT` → Contract (one-to-many)
  - `DEPENDS_ON` → Service (many-to-many through Contract)

### Contract

- **Properties**:
  - `id`: UUID - Unique identifier
  - `service_id`: UUID (FK) - Service that provides the contract
  - `name`: VARCHAR - Contract name (e.g., "GetUserById")
  - `http_method`: VARCHAR - HTTP method (GET, POST, PUT, DELETE, etc.)
  - `path`: VARCHAR - Endpoint path (e.g., "/users/{id}")
  - `request_schema`: JSONB - JSON Schema for request
  - `response_schema`: JSONB - JSON Schema for response
  - `parameters`: JSONB - Parameters (path, query, header)
  - `source_type`: ENUM - Extraction source (annotation, openapi, manual, llm, hybrid)
  - `source_file`: VARCHAR - File from which contract was extracted
  - `source_line`: INTEGER - Line number (if applicable)
  - `extraction_confidence`: DECIMAL (0-1, nullable) - Confidence score for extraction (higher for LLM-validated)
  - `current_version_id`: UUID (FK, nullable) - Reference to current version in ContractVersion
  - `created_at`: TIMESTAMP - Creation date
  - `updated_at`: TIMESTAMP - Update date
- **Relationships**:
  - `PROVIDED_BY` → Service (many-to-one)
  - `USED_BY` → Service (many-to-many through ServiceContractUsage)
  - `HAS_VERSIONS` → ContractVersion (one-to-many)

### ContractVersion

- **Purpose**: Version history for contracts to enable change analysis
- **Properties**:
  - `id`: UUID - Unique identifier
  - `contract_id`: UUID (FK) - Reference to contract
  - `version`: INTEGER - Version number (auto-incrementing)
  - `snapshot`: JSONB - Complete contract snapshot at this version
    - Contains: http_method, path, request_schema, response_schema, parameters
  - `change_summary`: TEXT - Summary of changes from previous version
  - `is_current`: BOOLEAN - Whether this is the current version
  - `created_at`: TIMESTAMP - When this version was created
  - `created_by`: VARCHAR (nullable) - User/system that created this version
- **Relationships**:
  - `BELONGS_TO` → Contract (many-to-one)

### ServiceContractUsage

- **Purpose**: Relationship between consumer service and another service's contract
- **Properties**:
  - `id`: UUID - Unique identifier
  - `consumer_service_id`: UUID (FK) - Service that uses the contract
  - `contract_id`: UUID (FK) - Contract being used
  - `contract_version_id`: UUID (FK, nullable) - Specific version being used (if tracked)
  - `usage_type`: ENUM - Usage type (direct_call, indirect, manual)
  - `detection_method`: ENUM - How dependency was detected (code_analysis, config, manual)
  - `detected_at`: TIMESTAMP - When dependency was detected
  - `confidence`: DECIMAL (0-1) - Confidence score for automatic detection
- **Relationships**:
  - `CONSUMES` → Service (many-to-one)
  - `USES` → Contract (many-to-one)
  - `USES_VERSION` → ContractVersion (many-to-one, optional)

## Relationship Types

### HAS_SERVICE

- **From**: System
- **To**: Service
- **Properties**: None
- **Cardinality**: One-to-many

### HAS_CONTRACT

- **From**: Service
- **To**: Contract
- **Properties**: None
- **Cardinality**: One-to-many

### DEPENDS_ON

- **From**: Service (consumer)
- **To**: Service (provider)
- **Properties**:
  - Implemented through ServiceContractUsage
  - Can add `dependency_strength` (number of contracts used)
- **Cardinality**: Many-to-many

## Schema Diagram

```
System --[HAS_SERVICE]--> Service --[HAS_CONTRACT]--> Contract --[HAS_VERSIONS]--> ContractVersion
                              |                              |                              |
                              |                              |                              |
                              +--[DEPENDS_ON]----------------+------------------------------+
                              (through ServiceContractUsage)
```

## Indexing Strategy

- **B-Tree Indexes**:
  - `systems.name` - Search systems by name
  - `services.system_id` - Fast search of system services
  - `services.repository_url` - Repository uniqueness check
  - `contracts.service_id` - Search contracts by service
  - `contracts.http_method, contracts.path` - Search contracts by method and path
  - `contract_versions.contract_id` - Fast lookup of contract versions
  - `contract_versions.is_current` - Find current version quickly
  - `service_contract_usage.consumer_service_id` - Search dependencies
  - `service_contract_usage.contract_id` - Search contract consumers
- **GIN Indexes (for JSONB fields)**:
  - `contracts.request_schema` - Search and query within request schemas
  - `contracts.response_schema` - Search and query within response schemas
  - `contracts.parameters` - Search within parameters
  - `contract_versions.snapshot` - Search within version snapshots
  - `services.metadata` - Search within service metadata
- **Composite Indexes**:
  - `contract_versions(contract_id, version)` - Fast version lookup and ordering
  - `service_contract_usage(consumer_service_id, contract_id)` - Fast dependency checks
- **Purpose**: Optimizing queries for graph visualization, dependency analysis, and schema comparison

## Query Patterns

### Get all system services with their contracts

```sql
SELECT s.*,
       json_agg(c.*) FILTER (WHERE c.id IS NOT NULL) as contracts
FROM services s
LEFT JOIN contracts c ON c.service_id = s.id
WHERE s.system_id = $1
GROUP BY s.id;
```

### Get dependency graph for visualization

```sql
-- Services as nodes
SELECT s.id, s.name, s.system_id
FROM services s
WHERE s.system_id = $1;

-- Dependencies as edges
SELECT
  sc.consumer_service_id as from_id,
  c.service_id as to_id,
  COUNT(*) as contract_count
FROM service_contract_usage sc
JOIN contracts c ON c.id = sc.contract_id
JOIN services s ON s.id = sc.consumer_service_id
WHERE s.system_id = $1
GROUP BY sc.consumer_service_id, c.service_id;
```

### Find all services depending on a specific contract

```sql
SELECT DISTINCT s.*
FROM services s
JOIN service_contract_usage scu ON scu.consumer_service_id = s.id
WHERE scu.contract_id = $1;
```

### Get contract version history

```sql
SELECT cv.*
FROM contract_versions cv
WHERE cv.contract_id = $1
ORDER BY cv.version DESC;
```

### Compare two contract versions

```sql
SELECT
  cv1.snapshot as old_version,
  cv2.snapshot as new_version
FROM contract_versions cv1
JOIN contract_versions cv2 ON cv2.contract_id = cv1.contract_id
WHERE cv1.contract_id = $1
  AND cv1.version = $2
  AND cv2.version = $3;
```

### Find contracts with breaking changes (schema comparison)

```sql
-- Example: Find contracts where required fields were removed
SELECT DISTINCT c.*
FROM contracts c
JOIN contract_versions cv ON cv.contract_id = c.id
WHERE cv.snapshot->'response_schema'->'required' IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM contract_versions cv2
    WHERE cv2.contract_id = c.id
      AND cv2.version > cv.version
      AND NOT (cv2.snapshot->'response_schema'->'required' @> cv.snapshot->'response_schema'->'required')
  );
```

## Data Ingestion

See [Data Ingestion Flow](./data_ingestion_flow.md) for how data enters this schema.

## Migration Strategy

- Using TypeORM migrations for schema management
- Migration versioning
- Rollback support when needed
- Data migrations when JSON schema structure changes

## Related Documentation

- [Architecture Design](../architecture_design.md) - System context
- [Data Ingestion Flow](./data_ingestion_flow.md) - How data flows in
- [Tech Stack](../tech_stack.md) - Database technology details

---

_Part of the [Patterns](../README.md#-patterns) collection_
