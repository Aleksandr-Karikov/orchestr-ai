# Contract Analysis Rules

## Overview

Contracts are analyzed to determine their structure, dependencies, and compatibility. In MVP, the focus is on REST API contracts from Spring Boot applications with OpenAPI/Swagger support.

## Analysis Rules

### Rule 1: HTTP Method and Path Extraction

- **Description**: Extracting HTTP method (GET, POST, PUT, DELETE, etc.) and endpoint path
- **Priority**: High
- **Example**:
  - `@GetMapping("/users/{id}")` → GET /users/{id}
  - `@PostMapping("/api/v1/orders")` → POST /api/v1/orders

### Rule 2: Parameter Type Analysis

- **Description**: Determining request parameter types (path, query, body, header)
- **Priority**: High
- **Example**:
  - `@PathVariable Long id` → path parameter, type: number
  - `@RequestParam String name` → query parameter, type: string
  - `@RequestBody UserDto user` → body parameter, schema from DTO

### Rule 3: Request/Response Schema Extraction

- **Description**: Extracting JSON schemas for request and response body
- **Priority**: High
- **Example**:
  - DTO classes converted to JSON Schema
  - OpenAPI specifications used directly if available

### Rule 4: Dependency Detection

- **Description**: Determining dependencies between services based on calls and configuration
- **Priority**: High
- **Detection Methods** (in order of priority):

  1. **HTTP Client Analysis** (Primary method):
     - Scan for `RestTemplate`, `WebClient`, `FeignClient`, `HttpClient` usage
     - Extract target URLs from code
     - Match URLs to service repository URLs or service names
     - Example: `restTemplate.getForObject("http://user-service/api/users/{id}", ...)` → dependency on user-service
     - Confidence: High (0.8-1.0)

  2. **Service Discovery Configuration** (Secondary method):
     - Parse `application.yml`, `application.properties`, `bootstrap.yml`
     - Extract service discovery URLs (Eureka, Consul, etc.)
     - Extract service names from configuration
     - Example: `eureka.client.service-url.defaultZone=http://user-service:8080` → dependency on user-service
     - Confidence: Medium (0.6-0.8)

  3. **URL Pattern Matching** (Fallback method):
     - Analyze hardcoded URLs in code
     - Match URL patterns to known service endpoints
     - Extract service name from URL structure
     - Example: `http://api.example.com/user-service/v1/users` → dependency on user-service
     - Confidence: Medium (0.5-0.7)

  4. **Manual Configuration** (User input):
     - Allow users to manually specify dependencies in UI
     - Override automatic detection when needed
     - Confidence: High (1.0)

- **Confidence Score Calculation**:
  - **Base confidence** by method (as listed above)
  - **Adjustments**:
    - +0.1 if multiple methods agree on same dependency
    - +0.1 if URL/service name matches exactly (case-insensitive)
    - -0.2 if URL pattern is ambiguous or generic (e.g., "http://api.example.com")
    - -0.1 if service name extracted from URL doesn't match any known service
  - **Final confidence**: min(1.0, base_confidence + adjustments)
  - **Thresholds**:
    - High confidence (≥0.8): Auto-create dependency, show in graph
    - Medium confidence (0.5-0.8): Auto-create but mark for review
    - Low confidence (<0.5): Don't auto-create, suggest manual review

- **Conflict Resolution**:
  - If multiple methods detect different dependencies: use highest confidence
  - If same dependency detected by multiple methods: use highest confidence, log all methods
  - Manual override always takes precedence (confidence = 1.0)

- **Implementation Details**:
  - Store detection method in `ServiceContractUsage.detection_method`
  - Store confidence score in `ServiceContractUsage.confidence`
  - Support multiple detection methods per dependency (use highest confidence)
  - Allow manual override of automatic detection
  - Store detection metadata (methods used, URLs found) in `ServiceContractUsage` metadata field (future enhancement)

## Analysis Process

1. **Extraction**: See [API Extraction Guide](../guides/api_extraction_guide.md)
   - **Primary Method (MVP)**: Static analysis
     - Parsing Spring Boot annotations
     - Parsing OpenAPI/Swagger files
     - Using configuration files to specify paths
   - **Enhancement Method (Future)**: LLM-powered extraction
     - Semantic code understanding for complex cases
     - Extraction from undocumented or poorly annotated code
     - Intelligent inference of contracts from code patterns
     - Natural language documentation generation
2. **Validation**:
   - Checking for required fields (method, path)
   - Validating JSON schemas
   - Checking contract uniqueness
   - Cross-validation between static and LLM results (future)
3. **Classification**:
   - Contract type (REST API)
   - Category (public, internal)
   - Version (if specified in path)
   - Confidence score (higher for LLM-validated contracts)
4. **Storage**: See [Graph Storage Schema](./graph_storage_schema.md)
   - Saving contracts with JSON schemas
   - Building relationships between services
   - Storing extraction method (static, LLM, hybrid) for traceability

## Contract Types

### Type 1: REST API Endpoint

- **Characteristics**:
  - HTTP method + path
  - Request parameters
  - Request/response schemas
  - May be described in OpenAPI/Swagger
- **Analysis Approach**:
  - Priority: Spring Boot annotation analysis
  - Fallback: OpenAPI/Swagger file parsing
  - Last resort: configuration files with paths

### Type 2: OpenAPI/Swagger Specification

- **Characteristics**:
  - Complete API description in OpenAPI 3.0 or Swagger 2.0 format
  - May contain multiple endpoints
  - Includes schemas, examples, documentation
- **Analysis Approach**:
  - Parsing YAML/JSON files
  - Extracting all endpoints from specification
  - Using as source of truth for contracts

## Breaking Change Detection

For detailed breaking change detection, see:

- [Breaking Change Check Workflow](../workflows/breaking_change_check.md)

## Related Documentation

- [API Extraction Guide](../guides/api_extraction_guide.md) - How to extract APIs
- [Breaking Change Check](../workflows/breaking_change_check.md) - Breaking change process
- [Data Ingestion Flow](./data_ingestion_flow.md) - How analysis fits into data flow

---

_Part of the [Patterns](../README.md#-patterns) collection_
