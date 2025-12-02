import {
  System,
  Service,
  Contract,
  ContractVersion,
  ServiceContractUsage,
} from "./entities";
import {
  IndexingStatus,
  SourceType,
  UsageType,
  DetectionMethod,
} from "./enums";

/**
 * DTOs for API requests and responses
 */

// System DTOs
export interface CreateSystemDto {
  name: string;
  description?: string;
}

export interface UpdateSystemDto {
  name?: string;
  description?: string;
}

export type SystemResponseDto = System;

// Service DTOs
export interface CreateServiceDto {
  system_id: string;
  name: string;
  repository_url: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateServiceDto {
  name?: string;
  repository_url?: string;
  metadata?: Record<string, unknown>;
}

export type ServiceResponseDto = Service;

// Contract DTOs
export interface CreateContractDto {
  service_id: string;
  name: string;
  http_method: string;
  path: string;
  request_schema?: Record<string, unknown>;
  response_schema?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  source_type: SourceType;
  source_file?: string;
  source_line?: number;
  extraction_confidence?: number;
}

export interface UpdateContractDto {
  name?: string;
  http_method?: string;
  path?: string;
  request_schema?: Record<string, unknown>;
  response_schema?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  source_type?: SourceType;
  source_file?: string;
  source_line?: number;
  extraction_confidence?: number;
}

export type ContractResponseDto = Contract;

// ContractVersion DTOs
export interface CreateContractVersionDto {
  contract_id: string;
  snapshot: Record<string, unknown>;
  change_summary?: string;
  created_by?: string;
}

export type ContractVersionResponseDto = ContractVersion;

// ServiceContractUsage DTOs
export interface CreateServiceContractUsageDto {
  consumer_service_id: string;
  contract_id: string;
  contract_version_id?: string;
  usage_type: UsageType;
  detection_method: DetectionMethod;
  confidence?: number;
}

export type ServiceContractUsageResponseDto = ServiceContractUsage;

// Graph/Dependency DTOs
export interface DependencyGraphNode {
  id: string;
  name: string;
  system_id: string;
  type: "service";
}

export interface DependencyGraphEdge {
  from: string; // consumer_service_id
  to: string; // provider_service_id (via contract.service_id)
  contract_count: number;
  contracts: string[]; // contract IDs
}

export interface DependencyGraphDto {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
}

// Query/Filter DTOs
export interface ListServicesQueryDto {
  system_id?: string;
  indexing_status?: IndexingStatus;
  limit?: number;
  offset?: number;
}

export interface ListContractsQueryDto {
  service_id?: string;
  http_method?: string;
  source_type?: SourceType;
  limit?: number;
  offset?: number;
}
