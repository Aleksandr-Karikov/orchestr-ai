# Guide: Adding New Language Support

## Overview

This guide walks through the process of adding support for a new programming language to the system.

## Prerequisites

- Understanding of [Tech Stack](../tech_stack.md)
- Familiarity with [Architecture Design](../architecture_design.md)
- Review of [Contract Analysis Rules](../patterns/contract_analysis_rules.md)

## Step-by-Step Process

### Step 1: Language Research
- [ ] Identify language-specific parsing requirements
- [ ] Review language documentation
- [ ] Identify key language constructs to extract

### Step 2: Parser Implementation
- [ ] Create language parser module
- [ ] Implement AST extraction
- [ ] Add language-specific rules

**Location**: `apps/backend/src/extractor/parsers/[language]/`

### Step 3: Contract Extraction
- [ ] Implement API/contract extraction for the language
- [ ] Follow patterns in [Contract Analysis Rules](../patterns/contract_analysis_rules.md)
- [ ] See [API Extraction Guide](./api_extraction_guide.md) for details

### Step 4: Schema Integration
- [ ] Update [Graph Storage Schema](../patterns/graph_storage_schema.md) if needed
- [ ] Add language-specific node types if required
- [ ] Update relationships

### Step 5: Testing
- [ ] Create test cases
- [ ] Test with sample code
- [ ] Validate against existing patterns

### Step 6: Documentation
- [ ] Update [Tech Stack](../tech_stack.md) with new language
- [ ] Document language-specific quirks
- [ ] Update relevant guides

## Language-Specific Considerations

### Spring Boot / Java (Current MVP)
- **Parser**: `java-parser` or `tree-sitter-java`
- **Key Features**: 
  - Annotations: `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`
  - Parameters: `@PathVariable`, `@RequestParam`, `@RequestBody`
  - DTO classes for request/response schemas
- **Common Patterns**: 
  - Controllers in packages `controller`, `rest`, `api`
  - DTOs in packages `dto`, `model`, `entity`
  - OpenAPI/Swagger annotations (`@ApiOperation`, `@ApiParam`)

### Future: Node.js / Express / NestJS
- **Parser**: `@babel/parser` or `typescript` compiler API
- **Key Features**:
  - NestJS decorators: `@Controller`, `@Get`, `@Post`
  - Express routes: `app.get()`, `router.post()`
- **Common Patterns**:
  - Controllers in folders `controllers`, `routes`
  - TypeScript types/interfaces for schemas

### Future: Python / FastAPI
- **Parser**: Python `ast` module or `tree-sitter-python`
- **Key Features**:
  - Decorators: `@app.get()`, `@app.post()`
  - Pydantic models for schemas
- **Common Patterns**:
  - Routers in files `routes.py`, `api.py`
  - Pydantic models in `models.py`, `schemas.py`

## Examples

### Example 1: Spring Boot Controller
```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        // ...
    }
    
    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody CreateUserDto dto) {
        // ...
    }
}
```

### Example 2: OpenAPI Specification
```yaml
openapi: 3.0.0
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

## Troubleshooting

### Common Issues
1. **Parser doesn't find controllers**: 
   - Check configuration files with paths
   - Ensure files match naming patterns
   - Verify project structure

2. **DTO schemas not extracted**:
   - Ensure DTO classes are available in classpath
   - Check that standard Jackson/Gson annotations are used
   - Consider using OpenAPI files as source of truth

3. **OpenAPI parsing errors**:
   - Check YAML/JSON validity
   - Ensure OpenAPI version compatibility (3.0.0 for MVP)

## Related Documentation

- [Tech Stack](../tech_stack.md) - Technology constraints
- [API Extraction Guide](./api_extraction_guide.md) - Extraction patterns
- [Contract Analysis Rules](../patterns/contract_analysis_rules.md) - Analysis rules
- [Graph Storage Schema](../patterns/graph_storage_schema.md) - Data model

---

*Part of the [Guides](../README.md#-guides) collection*
