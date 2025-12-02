# Guide: API Extraction

## Overview

This guide explains how to extract and document APIs from source code.

## Extraction Process

### Step 1: Identify API Boundaries
- [ ] Locate API entry points
- [ ] Identify request/response structures
- [ ] Map authentication mechanisms

### Step 2: Extract Contract Information
Follow rules defined in [Contract Analysis Rules](../patterns/contract_analysis_rules.md):
- [ ] Extract method signatures
- [ ] Extract parameter types
- [ ] Extract return types
- [ ] Extract error types

### Step 3: Document Dependencies
- [ ] Map internal dependencies
- [ ] Map external dependencies
- [ ] Document version information

### Step 4: Store in Graph
- [ ] Create nodes per [Graph Storage Schema](../patterns/graph_storage_schema.md)
- [ ] Create relationships
- [ ] Add metadata

## Language-Specific Extraction

### Spring Boot / Java (MVP)

#### Extraction from Annotations
```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        // Extracted: GET /api/v1/users/{id}
        // Path parameter: id (Long)
        // Response: UserDto
    }
    
    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody CreateUserDto dto) {
        // Extracted: POST /api/v1/users
        // Request body: CreateUserDto
        // Response: UserDto
    }
}
```

**Extraction Process**:
1. Find classes with `@RestController` or `@Controller`
2. Extract base path from `@RequestMapping` on class
3. For each method with HTTP annotation:
   - Extract HTTP method and path
   - Extract parameters (`@PathVariable`, `@RequestParam`, `@RequestBody`)
   - Determine return type
   - Build JSON Schema from DTO classes

#### Extraction from OpenAPI/Swagger
```yaml
# openapi.yaml
paths:
  /users/{id}:
    get:
      parameters:
        - name: id
          in: path
          schema:
            type: integer
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

**Extraction Process**:
1. Find files `openapi.yaml`, `swagger.json` in repository
2. Parse YAML/JSON using `swagger-parser`
3. Extract all endpoints from `paths`
4. Resolve schema references from `components/schemas`

### Future: Node.js / Express
```typescript
// Express
app.get('/users/:userId', (req, res) => {
    // Extracted: GET /users/:userId
});

// NestJS
@Controller('users')
export class UserController {
    @Get(':id')
    findOne(@Param('id') id: string) {
        // Extracted: GET /users/:id
    }
}
```

## Extraction Patterns

### Pattern 1: REST API (MVP)
- **Identification**: 
  - Spring Boot: Classes with `@RestController`
  - OpenAPI: Files `openapi.yaml`, `swagger.json`
  - Configuration files with controller paths
- **Extraction Methods**:
  - **Static Analysis (Primary)**: 
    - HTTP method (GET, POST, PUT, DELETE, PATCH)
    - Endpoint path (with parameters)
    - Request parameters (path, query, body, header)
    - JSON Schema for request and response
  - **LLM-Powered (Future)**:
    - Semantic understanding of code without annotations
    - Inference of contracts from code patterns
    - Enhanced schema generation from DTO classes
    - Natural language documentation
- **Storage**: 
  - `contracts` table in PostgreSQL
  - JSON schemas in JSONB fields `request_schema` and `response_schema`
  - `source_type` field indicates extraction method (annotation, openapi, manual, llm)

### Pattern 2: GraphQL (Future)
- **Identification**: Files `.graphql`, `schema.graphql`
- **Extraction**: 
  - Types, queries, mutations
  - Parameters and return types
- **Storage**: Schema adaptation for GraphQL specifics

### Pattern 3: gRPC (Future)
- **Identification**: Files `.proto`
- **Extraction**: 
  - Service definitions
  - RPC methods
  - Message types
- **Storage**: Schema adaptation for gRPC specifics

## Validation

- [ ] Validate extracted contracts
- [ ] Check for completeness
- [ ] Verify relationships

## Related Documentation

- [Contract Analysis Rules](../patterns/contract_analysis_rules.md) - Analysis rules
- [Graph Storage Schema](../patterns/graph_storage_schema.md) - Storage structure
- [New Service Analysis Workflow](../workflows/new_service_analysis.md) - Full analysis process
- [Adding New Language](./adding_new_language.md) - Language-specific extraction

---

*Part of the [Guides](../README.md#-guides) collection*
