import { IndexingStatus, SourceType, UsageType, DetectionMethod } from './enums';

/**
 * System entity - High-level entity that groups related microservices
 */
export interface System {
  id: string; // UUID
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Service entity - Individual microservice in the system
 */
export interface Service {
  id: string; // UUID
  system_id: string; // UUID, FK to System
  name: string;
  repository_url: string;
  repository_path?: string; // Local path (temporary)
  last_indexed_at?: Date;
  indexing_status: IndexingStatus;
  metadata?: Record<string, unknown>; // JSONB
}

/**
 * Contract entity - Description of an API endpoint between services
 */
export interface Contract {
  id: string; // UUID
  service_id: string; // UUID, FK to Service
  name: string; // e.g., "GetUserById"
  http_method: string; // GET, POST, PUT, DELETE, etc.
  path: string; // e.g., "/users/{id}"
  request_schema?: Record<string, unknown>; // JSONB - JSON Schema for request
  response_schema?: Record<string, unknown>; // JSONB - JSON Schema for response
  parameters?: Record<string, unknown>; // JSONB - Parameters (path, query, header)
  source_type: SourceType;
  source_file?: string; // File from which contract was extracted
  source_line?: number; // Line number (if applicable)
  extraction_confidence?: number; // 0-1, nullable - Confidence score for extraction
  current_version_id?: string; // UUID, FK to ContractVersion, nullable
  created_at: Date;
  updated_at: Date;
}

/**
 * ContractVersion entity - Version history for contracts to enable change analysis
 */
export interface ContractVersion {
  id: string; // UUID
  contract_id: string; // UUID, FK to Contract
  version: number; // Version number (auto-incrementing)
  snapshot: Record<string, unknown>; // JSONB - Complete contract snapshot at this version
  change_summary?: string; // Summary of changes from previous version
  is_current: boolean; // Whether this is the current version
  created_at: Date;
  created_by?: string; // User/system that created this version
}

/**
 * ServiceContractUsage entity - Relationship between consumer service and another service's contract
 */
export interface ServiceContractUsage {
  id: string; // UUID
  consumer_service_id: string; // UUID, FK to Service
  contract_id: string; // UUID, FK to Contract
  contract_version_id?: string; // UUID, FK to ContractVersion, nullable
  usage_type: UsageType;
  detection_method: DetectionMethod;
  detected_at: Date;
  confidence?: number; // 0-1 - Confidence score for automatic detection
}

