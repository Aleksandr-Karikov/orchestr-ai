# Guide: Visualization Engine

## Overview

Visualization of dependency graph between microservices. The graph displays services as nodes and contracts/dependencies as edges. MVP uses `react-flow` or `vis-network` library for interactive visualization.

## Architecture

See [Architecture Design](../architecture_design.md) for system context.

## Components

### GraphDataService (Backend)
- **Purpose**: Preparing graph data from database
- **Input**: System ID
- **Output**: JSON with nodes (services) and edges (dependencies)
- **Location**: `apps/backend/src/visualization/graph-data.service.ts`

### GraphVisualization Component (Frontend)
- **Purpose**: React component for displaying graph
- **Input**: Graph data from API
- **Output**: Interactive graph in browser
- **Location**: `apps/frontend/src/components/GraphVisualization.tsx`

### GraphLayout Engine
- **Purpose**: Automatic node placement
- **Input**: List of nodes and edges
- **Output**: Node coordinates
- **Options**: Force-directed layout, hierarchical layout

## Usage

### Basic Usage
```typescript
// Frontend component
import { GraphVisualization } from '@/components/GraphVisualization';

function SystemGraph({ systemId }: { systemId: string }) {
  const { data, loading } = useGraphData(systemId);
  
  if (loading) return <Spinner />;
  
  return (
    <GraphVisualization 
      nodes={data.nodes}
      edges={data.edges}
      onNodeClick={handleNodeClick}
    />
  );
}
```

### Advanced Usage
```typescript
// With filtering and highlighting
<GraphVisualization 
  nodes={data.nodes}
  edges={data.edges}
  filters={{
    showOnlyChanged: true,
    highlightService: selectedServiceId
  }}
  layout="hierarchical"
  onEdgeClick={showContractDetails}
/>
```

## Visualization Types

### Type 1: Dependency Graph (MVP)
- **Purpose**: Visualization of dependencies between services
- **Data Source**: 
  - Nodes: `services` table
  - Edges: `service_contract_usage` + `contracts` tables
- **Configuration**: 
  - Node colors by indexing status
  - Edge thickness by number of contracts
  - Edge labels with contract names

### Type 2: Contract Flow (Future)
- **Purpose**: Detailed visualization of data flow through contracts
- **Data Source**: Contracts with their schemas
- **Configuration**: Display data types, parameters

## Data Flow

1. **Data Retrieval**: 
   - Frontend requests data via API: `GET /api/systems/:id/graph`
   - Backend executes database queries (see [Graph Storage Schema](../patterns/graph_storage_schema.md))
   - Returns JSON with nodes and edges
2. **Processing**: 
   - Transform database data to visualization format
   - Apply layout algorithm for node placement
   - Filter and group if necessary
3. **Rendering**: 
   - Use `react-flow` or `vis-network` for rendering
   - Interactivity: zoom, pan, drag nodes
   - Event handling: clicks on nodes/edges

## Configuration

### Configuration Options
- `layout`: `'force'` | `'hierarchical'` | `'circular'` - Node placement type
- `nodeSize`: `number` - Node size
- `edgeStyle`: `'straight'` | `'smooth'` | `'step'` - Edge style
- `showLabels`: `boolean` - Whether to show edge labels
- `highlightOnHover`: `boolean` - Highlight related nodes on hover

### Example Configuration
```typescript
const graphConfig = {
  layout: 'force',
  nodeSize: 100,
  edgeStyle: 'smooth',
  showLabels: true,
  highlightOnHover: true,
  nodeColors: {
    indexed: '#4CAF50',
    pending: '#FFC107',
    failed: '#F44336'
  }
};
```

## Customization

### Node Customization
- Service icons
- Colors by status or type
- Sizes by number of contracts

### Edge Customization
- Colors by dependency type
- Thickness by number of contracts
- Arrows for dependency direction

### Interactivity
- Click on node: show service details
- Click on edge: show contracts
- Double click: open detailed page

## Performance Considerations

- **Virtualization**: For large graphs (100+ nodes) use virtualization
- **Caching**: Cache graph data on frontend
- **Lazy loading**: Load node details on demand
- **Layout optimization**: Use Web Workers for layout calculations
- **Debouncing**: Debounce events during interactivity

## Related Documentation

- [Architecture Design](../architecture_design.md) - System architecture
- [Graph Storage Schema](../patterns/graph_storage_schema.md) - Data model
- [Data Ingestion Flow](../patterns/data_ingestion_flow.md) - Data flow

---

*Part of the [Guides](../README.md#-guides) collection*
