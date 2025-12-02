# LLM Integration Plan - Future Enhancement

## Overview

This document outlines the plan for integrating Large Language Models (LLMs) into Orchestr-AI for enhanced contract extraction and analysis. LLM integration is planned for Phase 2+ and will work alongside static analysis as an enhancement and fallback mechanism.

## Goals

### Primary Goals

- **Enhanced Contract Extraction**: Extract contracts from complex, undocumented, or poorly annotated code
- **Semantic Understanding**: Understand code context and infer contracts from patterns
- **Intelligent Dependency Detection**: Detect dependencies from code semantics, not just explicit calls
- **Natural Language Documentation**: Generate human-readable contract documentation
- **Breaking Change Analysis**: AI-powered analysis of contract changes and their impact

### Success Metrics

- Extraction accuracy improvement: > 95% for all code types (vs 90% for static analysis)
- Coverage: Ability to extract contracts from code without annotations
- Cost efficiency: LLM usage < 20% of total extraction operations (hybrid approach)
  - **Measurement**: Count of LLM API calls / Total extraction operations (static + LLM)
  - **Enforcement**: Circuit breaker pattern - disable LLM if threshold exceeded
  - **Monitoring**: Track per-service, per-day, per-organization usage
- Response time: LLM-enhanced extraction < 30 seconds per service

## Architecture

### Integration Strategy

**Hybrid Approach**: Static analysis first, LLM as enhancement/fallback

```
1. Try Static Analysis (fast, free)
   ↓ (if incomplete/failed)
2. Use LLM Enhancement (slower, costs)
   ↓
3. Merge Results
   ↓
4. Cache LLM Results (avoid repeat calls)
```

### LLM Service Component

**Location**: `apps/backend/src/llm/`

**Responsibilities**:

- LLM API integration (OpenAI, Anthropic, local models)
- Prompt engineering and management
- Response parsing and validation
- Caching and rate limiting
- Cost tracking and optimization

### Integration Points

1. **Contract Extractor Service**

   - Strategy pattern: `StaticExtractor` (primary) + `LLMExtractor` (enhancement)
   - Fallback mechanism when static analysis fails
   - Result merging and validation

2. **Dependency Detection**

   - LLM-powered semantic analysis of code
   - Understanding implicit dependencies from code context
   - Enhanced confidence scoring

3. **Change Analyzer Service**
   - AI-powered breaking change detection
   - Natural language explanations of changes
   - Impact analysis with reasoning

## Technology Choices

### LLM Providers

#### Option 1: OpenAI API (Recommended for MVP)

- **Models**: GPT-4, GPT-3.5-turbo
- **Pros**:
  - Best code understanding capabilities
  - Reliable API
  - Good documentation
- **Cons**:
  - Cost per token
  - Data privacy concerns (code sent to external API)
- **Use Case**: Cloud deployments, development

#### Option 2: Anthropic Claude API

- **Models**: Claude 3 Opus, Sonnet
- **Pros**:
  - Strong code analysis
  - Longer context windows
  - Good for complex codebases
- **Cons**:
  - Similar cost structure
  - Data privacy concerns
- **Use Case**: Alternative to OpenAI

#### Option 3: Local Models (Ollama, LM Studio)

- **Models**: CodeLlama, DeepSeek Coder, local fine-tuned models
- **Pros**:
  - Complete data privacy
  - No API costs
  - Full control
- **Cons**:
  - Requires infrastructure
  - Lower accuracy than cloud models
  - Higher latency
- **Use Case**: On-premise deployments, sensitive codebases

### Implementation Libraries

- **`openai`**: OpenAI API client for Node.js
- **`@anthropic-ai/sdk`**: Anthropic API client
- **`langchain`** (optional): LLM orchestration, prompt management, chain building
- **`zod`**: Response validation and parsing

## Use Cases

### Use Case 1: Contract Extraction from Undocumented Code

**Scenario**: Code without Spring Boot annotations or OpenAPI specs

**LLM Prompt Example**:

````
You are an expert API contract analyzer. Analyze the following Java code and extract REST API contracts.

Code:
```java
[Code snippet]
````

Extract all REST API endpoints and return a JSON array with the following structure:
{
"contracts": [
{
"httpMethod": "GET|POST|PUT|DELETE|PATCH",
"path": "/api/v1/resource/{id}",
"requestSchema": { /_ JSON Schema _/ },
"responseSchema": { /_ JSON Schema _/ },
"parameters": {
"path": [...],
"query": [...],
"header": [...]
},
"confidence": 0.0-1.0
}
]
}

Rules:

- Extract from @RestController, @RequestMapping, @GetMapping, @PostMapping annotations
- Infer request/response schemas from DTO classes
- Include path variables and query parameters
- Return empty array if no contracts found

```

**Expected Output**: Structured contract with JSON schemas

### Use Case 2: Enhanced Dependency Detection

**Scenario**: Implicit dependencies not caught by static analysis

**LLM Prompt Example**:

```

Analyze this service code and identify all external service dependencies:

[Code snippet]

Consider:

- HTTP client calls
- Service discovery references
- Configuration files
- Environment variables

Return list of dependent services with confidence scores.

```

**Expected Output**: List of dependencies with confidence scores

### Use Case 3: Breaking Change Analysis

**Scenario**: Complex schema changes that need semantic understanding

**LLM Prompt Example**:

```

Compare these two API contract versions:

Old: [JSON Schema]
New: [JSON Schema]

Identify:

1. Breaking changes (high/medium/low severity)
2. Affected client code patterns
3. Migration recommendations
4. Natural language explanation

```

**Expected Output**: Detailed breaking change report with explanations

### Use Case 4: Documentation Generation

**Scenario**: Generate human-readable contract documentation

**LLM Prompt Example**:

```

Generate API documentation for this contract:

[Contract JSON]

Include:

- Endpoint description
- Parameter explanations
- Example requests/responses
- Common use cases

```

**Expected Output**: Markdown documentation

## Cost Management

### Strategies

1. **Caching**: Cache LLM responses in Redis

   - Key: hash of code snippet + prompt template
   - TTL: 30 days (or until code changes)
   - Reduces API calls by 70-80%

2. **Rate Limiting**: Throttle LLM API calls

   - Max concurrent requests: 5
   - Per-user quotas
   - Priority queue for urgent requests

3. **Selective Usage**: Only use LLM when needed

   - Static analysis succeeds → skip LLM
   - Static analysis partial → LLM for missing parts
   - Static analysis fails → full LLM extraction

4. **Model Selection**: Use cheaper models when possible

   - GPT-3.5-turbo for simple cases
   - GPT-4 for complex analysis
   - Local models for on-premise

5. **Token Optimization**: Minimize prompt size
   - Code chunking for large files
   - Summarization before sending
   - Focused prompts (not entire codebase)

### Cost Estimation

**Assumptions**:

- Average service: 10 controllers, 50 endpoints
- Average prompt: 2000 tokens input, 500 tokens output
- GPT-4: $0.03/1K input, $0.06/1K output
- GPT-3.5-turbo: $0.0015/1K input, $0.002/1K output

**Per Service Cost** (without caching):

- GPT-4: ~$0.75 per service (simple) to ~$2.50 per service (complex with many files)
- GPT-3.5-turbo: ~$0.04 per service (simple) to ~$0.15 per service (complex)

**With 80% cache hit rate**:

- GPT-4: ~$0.15 per service (simple) to ~$0.50 per service (complex)
- GPT-3.5-turbo: ~$0.008 per service (simple) to ~$0.03 per service (complex)

**Cost Monitoring Recommendations**:
- Set per-organization monthly budget limits
- Alert when 80% of budget consumed
- Auto-fallback to static-only mode if budget exceeded
- Daily cost reports per system/service

## Implementation Plan

### Phase 2.1: Foundation (2-3 weeks)

- [ ] LLM service module setup
- [ ] OpenAI API integration
- [ ] Basic prompt templates
- [ ] Response parsing and validation
- [ ] Error handling and retries

### Phase 2.2: Contract Extraction (3-4 weeks)

- [ ] LLM extractor implementation
- [ ] Integration with Contract Extractor Service
- [ ] Fallback mechanism
- [ ] Result merging logic
- [ ] Testing with real codebases

### Phase 2.3: Caching and Optimization (2 weeks)

- [ ] Redis caching for LLM responses
- [ ] Rate limiting implementation
- [ ] Cost tracking and monitoring
- [ ] Token optimization
- [ ] Performance tuning

### Phase 2.4: Advanced Features (3-4 weeks)

- [ ] Dependency detection enhancement
- [ ] Breaking change analysis
- [ ] Documentation generation
- [ ] Multi-provider support (Anthropic, local)
- [ ] Fine-tuning prompts based on results

## Data Privacy and Security

### Considerations

1. **Code Privacy**:

   - Option for on-premise LLM deployment
   - Code chunking to minimize data exposure
   - User consent for cloud LLM usage

2. **API Keys**:

   - Secure storage of LLM API keys
   - Per-user/organization key management
   - Key rotation support

3. **Audit Logging**:
   - Log all LLM API calls
   - Track costs per user/organization
   - Monitor for abuse

## Testing Strategy

### Unit Tests

- Prompt generation
- Response parsing
- Error handling
- Caching logic

### Integration Tests

- End-to-end extraction with LLM
- Fallback mechanism
- Result merging
- Cost tracking

### Performance Tests

- Latency measurements
- Throughput testing
- Cache effectiveness
- Cost optimization validation

## Monitoring and Observability

### Metrics to Track

- **Usage Metrics**:
  - LLM API call count (total, per-service, per-user, per-organization)
  - LLM usage percentage (calls / total extractions)
  - Cache hit rate (target: > 80%)
  - Token usage (input/output, per model)

- **Performance Metrics**:
  - Average response time (p50, p95, p99)
  - Time to first token (TTFT)
  - End-to-end extraction time (static + LLM)

- **Cost Metrics**:
  - Cost per service/indexing
  - Daily/monthly cost per organization
  - Cost per token (by model)
  - Budget utilization percentage

- **Quality Metrics**:
  - Extraction accuracy (validated contracts / total extracted)
  - LLM extraction confidence scores
  - Error rate (by error type)
  - Retry rate

### Alerts

- High cost threshold exceeded
- High error rate
- API quota approaching limit
- Unusual latency spikes

## Migration Path

### For Existing Systems

1. **Gradual Rollout**:

   - Enable LLM for new services first
   - Monitor results and costs
   - Gradually enable for existing services

2. **User Control**:

   - Allow users to enable/disable LLM
   - Per-service LLM usage toggle
   - Cost budget limits

3. **Backward Compatibility**:
   - Static analysis always available
   - LLM results supplement, don't replace
   - Easy rollback to static-only mode

## Related Documentation

- [Architecture Design](../architecture_design.md) - System architecture
- [Data Ingestion Flow](../patterns/data_ingestion_flow.md) - Extraction pipeline
- [Contract Analysis Rules](../patterns/contract_analysis_rules.md) - Analysis patterns
- [Tech Stack](../tech_stack.md) - Technology choices
- [MVP Spec Phase 1](./mvp_spec_phase_1.md) - Current phase scope

---

_This is a planning document for future phases. Implementation details may evolve based on LLM technology advances and user feedback._
```
