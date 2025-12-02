# Product Brief

## Vision

Orchestr-AI is an orchestrator for distributed systems and a visualizer of microservice architectures. The system automatically analyzes microservice code, extracts contracts between them, builds dependency visualizations, and helps identify bottlenecks and compatibility issues when changes occur.

## Goals

### Primary Goals

- Automatic extraction and documentation of contracts between microservices
- Visualization of distributed system architecture as a dependency graph
- Analysis of contract changes with automatic identification of affected services
- Identification of bottlenecks and potential compatibility issues

### Success Metrics

- Contract extraction accuracy (should be > 90% for Spring Boot + OpenAPI)
- System indexing time (target: < 5 minutes for 10 microservices)
- Dependency visualization completeness (all connections must be displayed)

## Problem Statement

In microservice architectures, it's difficult to track:

- What contracts exist between services
- How changes in one service affect others
- Where bottlenecks and dependencies are located
- Which services need to be updated when a contract changes

Manual documentation quickly becomes outdated, and the lack of current information leads to breaking changes and deployment issues.

## Target Users

- **DevOps Engineers** - for understanding architecture and planning changes
- **Backend Developers** - for understanding dependencies and contracts
- **Architects** - for analyzing and optimizing architecture
- **Tech Leads** - for controlling changes and migrations

## Key Features

1. **System Management** - creating and configuring systems with multiple microservices
2. **Automatic Indexing** - scanning repositories and extracting contracts
3. **Graph Visualization** - interactive dependency graph between services
4. **Manual Contract Editing** - ability to correct extracted contracts
5. **Change Analysis** - automatic identification of affected services when a contract changes
6. **Bottleneck Detection** - analysis of architecture for problematic dependencies

## Business Context

Microservice architectures are becoming the standard for large applications. Managing the complexity of such systems requires automation tools. Orchestr-AI solves the problem of "documentation that's always outdated" through automatic extraction of information from code.

## Related Documentation

- [Architecture Design](./architecture_design.md) - How the system is built
- [Tech Stack](./tech_stack.md) - Technology choices
- [MVP Spec Phase 1](./specs/mvp_spec_phase_1.md) - Initial implementation plan

---

_For implementation details, see [Architecture Design](./architecture_design.md)_
