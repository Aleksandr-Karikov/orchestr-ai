# @orchestr-ai/shared

Shared TypeScript types and utilities for Orchestr-AI.

## Overview

This package contains:
- Entity types (System, Service, Contract, ContractVersion, ServiceContractUsage)
- Enums (IndexingStatus, SourceType, UsageType, DetectionMethod)
- DTOs for API requests and responses
- Graph/Dependency visualization types

## Usage

```typescript
import { System, Service, Contract, IndexingStatus } from '@orchestr-ai/shared';

const service: Service = {
  id: '...',
  system_id: '...',
  name: 'user-service',
  repository_url: 'https://github.com/...',
  indexing_status: IndexingStatus.PENDING,
  // ...
};
```

## Building

```bash
pnpm build
```

## Development

```bash
pnpm dev  # Watch mode
```

## Related Documentation

- [Graph Storage Schema](../../memory_bank/patterns/graph_storage_schema.md) - Database schema details

