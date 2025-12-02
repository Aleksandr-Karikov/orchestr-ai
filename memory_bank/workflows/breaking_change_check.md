# Workflow: Breaking Change Check

## Purpose

This workflow guides agents through detecting and analyzing breaking changes in contracts/APIs.

## Prerequisites

- Access to old and new contract versions
- Understanding of [Contract Analysis Rules](../patterns/contract_analysis_rules.md)
- Familiarity with [API Extraction Guide](../guides/api_extraction_guide.md)

## Step-by-Step Instructions

### Step 1: Extract Contracts

- [ ] Extract old version contract
  - Follow [API Extraction Guide](../guides/api_extraction_guide.md)
- [ ] Extract new version contract
- [ ] Store both in graph
  - See [Graph Storage Schema](../patterns/graph_storage_schema.md)

### Step 2: Compare Contracts

Apply comparison rules from [Contract Analysis Rules](../patterns/contract_analysis_rules.md):

- [ ] Compare method signatures
- [ ] Compare parameter types
- [ ] Compare return types
- [ ] Compare error types
- [ ] Compare required vs optional fields

### Step 3: Classify Changes

#### Breaking Changes (High Priority)

- [ ] Removed methods/endpoints
- [ ] Changed parameter types
- [ ] Changed return types
- [ ] Made required fields optional (or vice versa)
- [ ] Removed fields from responses

#### Non-Breaking Changes (Low Priority)

- [ ] Added new methods/endpoints
- [ ] Added optional parameters
- [ ] Added new optional fields
- [ ] Extended return types (backward compatible)

### Step 4: Impact Analysis

- [ ] Identify dependent services
- [ ] Assess impact severity
- [ ] Map affected components
  - See [Architecture Design](../architecture_design.md) for system context

### Step 5: Documentation

- [ ] Document breaking changes
- [ ] Create migration guide (if needed)
- [ ] Update [Current Tasks](../current_tasks.md) with required actions

## Change Detection Rules

### Rule 1: HTTP Method and Path Changes

- **Breaking**:
  - HTTP method change (GET → POST, etc.)
  - Path change (even if similar, e.g., `/users/{id}` → `/users/{userId}`)
  - Path parameter name change (affects client code)
- **Non-breaking**:
  - Adding new endpoints (new method + path combination)
  - Path remains the same with same parameters

### Rule 2: Parameter Changes

- **Breaking**:
  - Removing required path parameters
  - Removing required query parameters
  - Changing parameter type (e.g., `string` → `number`)
  - Making optional parameter required
  - Changing parameter name (path/query)
- **Non-breaking**:
  - Adding new optional query parameters
  - Adding new optional path parameters (only if at end)
  - Making required parameter optional
  - Adding new optional header parameters

### Rule 3: Request Body Schema Changes

- **Breaking**:
  - Removing required fields from request body
  - Changing field type (e.g., `string` → `number`, `string` → `object`)
  - Narrowing type (e.g., `string | number` → `string`)
  - Changing field name
  - Making optional field required
  - Removing enum values
  - Adding new required enum values
- **Non-breaking**:
  - Adding new optional fields
  - Widening type (e.g., `string` → `string | number`)
  - Adding new enum values (if existing values remain)
  - Making required field optional
  - Extending object with optional properties

### Rule 4: Response Body Schema Changes

- **Breaking**:
  - Removing fields from response (even if optional, may break clients)
  - Changing field type
  - Narrowing type
  - Changing field name
  - Removing enum values
  - Changing HTTP status codes for success responses
- **Non-breaking**:
  - Adding new optional fields
  - Adding new required fields (backward compatible if clients ignore)
  - Widening type
  - Adding new enum values
  - Adding new HTTP status codes (as long as existing ones remain)

### Rule 5: Header Changes

- **Breaking**:
  - Removing required headers
  - Changing header value format/type
- **Non-breaking**:
  - Adding new optional headers
  - Making required header optional

### Rule 6: Error Response Changes

- **Breaking**:
  - Changing error response format
  - Removing error codes
  - Changing error message structure
- **Non-breaking**:
  - Adding new error codes
  - Extending error response with optional fields

## Algorithm Implementation

### Step 1: Extract Contract Versions

1. Get old version: `contract_versions WHERE contract_id = X AND version = Y`
2. Get new version: `contract_versions WHERE contract_id = X AND version = Z`
3. Load JSON schemas from `snapshot` field

### Step 2: Compare Schemas

Use `json-schema-diff` library or custom comparison:

```typescript
interface BreakingChange {
  type:
    | "method"
    | "path"
    | "parameter"
    | "request_field"
    | "response_field"
    | "header";
  severity: "high" | "medium" | "low";
  description: string;
  oldValue: any;
  newValue: any;
  affectedServices: Service[];
}
```

### Step 3: Apply Rules

For each rule category:

1. Compare old vs new schema
2. Identify changes
3. Classify as breaking/non-breaking
4. Assign severity:
   - **High**: Removes functionality, changes types
   - **Medium**: Changes structure but may be compatible
   - **Low**: Minor changes, likely compatible

### Step 4: Impact Analysis

1. Find all services using this contract:

   ```sql
   SELECT DISTINCT s.*
   FROM services s
   JOIN service_contract_usage scu ON scu.consumer_service_id = s.id
   WHERE scu.contract_id = $1
   ```

2. Calculate impact score:
   - Number of dependent services
   - Confidence of dependency detection
   - Usage frequency (if tracked)

### Step 5: Generate Report

Create structured report with:

- List of breaking changes (categorized by severity)
- List of non-breaking changes
- Affected services
- Recommended actions
- Migration suggestions

## Output Format

```markdown
## Breaking Changes Detected

### High Severity

- [Change description] - [Impact]

### Medium Severity

- [Change description] - [Impact]

### Low Severity

- [Change description] - [Impact]
```

## Related Documentation

- [Contract Analysis Rules](../patterns/contract_analysis_rules.md) - Analysis rules
- [API Extraction Guide](../guides/api_extraction_guide.md) - Extraction process
- [New Service Analysis](../workflows/new_service_analysis.md) - Full analysis workflow
- [Graph Storage Schema](../patterns/graph_storage_schema.md) - Storage structure

---

_Part of the [Workflows](../README.md#-workflows) collection_
