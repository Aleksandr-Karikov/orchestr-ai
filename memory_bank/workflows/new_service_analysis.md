# Workflow: New Service Analysis

## Purpose

This workflow guides agents through the process of analyzing a new service for integration.

## Prerequisites

- Access to service code/repository
- Understanding of [Architecture Design](../architecture_design.md)
- Familiarity with [Contract Analysis Rules](../patterns/contract_analysis_rules.md)

## Step-by-Step Instructions

### Step 1: Initial Assessment
- [ ] Identify service type (API, library, microservice, etc.)
- [ ] Locate entry points
- [ ] Identify programming language(s)
  - See [Adding New Language Guide](../guides/adding_new_language.md) if new language

### Step 2: Code Analysis
- [ ] Extract API contracts
  - Follow [API Extraction Guide](../guides/api_extraction_guide.md)
- [ ] Identify dependencies
- [ ] Map service boundaries

### Step 3: Contract Analysis
Apply rules from [Contract Analysis Rules](../patterns/contract_analysis_rules.md):
- [ ] Validate contract structure
- [ ] Identify breaking change risks
- [ ] Classify contract type

### Step 4: Data Flow Analysis
- [ ] Map data ingestion points
  - See [Data Ingestion Flow](../patterns/data_ingestion_flow.md)
- [ ] Identify data transformations
- [ ] Map to storage schema
  - See [Graph Storage Schema](../patterns/graph_storage_schema.md)

### Step 5: Integration Planning
- [ ] Identify integration points
- [ ] Plan data storage
- [ ] Plan visualization (if applicable)
  - See [Visualization Engine Guide](../guides/visualization_engine.md)

### Step 6: Documentation
- [ ] Document findings
- [ ] Update relevant [Patterns](../patterns/) if new patterns discovered
- [ ] Update [Current Tasks](../current_tasks.md) with follow-up work

## Decision Points

### Decision 1: Language Support
- **If new language**: Follow [Adding New Language Guide](../guides/adding_new_language.md)
- **If existing language**: Use existing parsers

### Decision 2: Contract Type
- **If REST API**: Use REST extraction patterns
- **If GraphQL**: Use GraphQL extraction patterns
- **If other**: Document new pattern

## Output

The analysis should produce:
1. Service metadata
2. Extracted contracts
3. Dependency graph
4. Integration recommendations

## Related Documentation

- [API Extraction Guide](../guides/api_extraction_guide.md) - Extraction process
- [Contract Analysis Rules](../patterns/contract_analysis_rules.md) - Analysis rules
- [Data Ingestion Flow](../patterns/data_ingestion_flow.md) - Data flow patterns
- [Graph Storage Schema](../patterns/graph_storage_schema.md) - Storage structure

---

*Part of the [Workflows](../README.md#-workflows) collection*

