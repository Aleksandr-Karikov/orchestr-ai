import {
  System,
  Service,
  Contract,
  ContractVersion,
  ServiceContractUsage,
  CreateSystemDto,
  CreateServiceDto,
  CreateContractDto,
  IndexingStatus,
  SourceType,
  UsageType,
  DetectionMethod,
} from '@orchestr-ai/shared';

/**
 * Test data factories for frontend tests
 */

export const createMockSystem = (overrides?: Partial<System>): System => ({
  id: overrides?.id || `system-${Date.now()}`,
  name: overrides?.name || `Test System ${Date.now()}`,
  description: overrides?.description || 'Test system description',
  created_at: overrides?.created_at || new Date(),
  updated_at: overrides?.updated_at || new Date(),
});

export const createMockService = (
  systemId: string,
  overrides?: Partial<Service>,
): Service => ({
  id: overrides?.id || `service-${Date.now()}`,
  system_id: systemId,
  name: overrides?.name || `Test Service ${Date.now()}`,
  repository_url:
    overrides?.repository_url || `https://github.com/test/service-${Date.now()}`,
  repository_path: overrides?.repository_path,
  last_indexed_at: overrides?.last_indexed_at,
  indexing_status: overrides?.indexing_status || IndexingStatus.PENDING,
  metadata: overrides?.metadata || {},
});

export const createMockContract = (
  serviceId: string,
  overrides?: Partial<Contract>,
): Contract => ({
  id: overrides?.id || `contract-${Date.now()}`,
  service_id: serviceId,
  name: overrides?.name || `Test Contract ${Date.now()}`,
  http_method: overrides?.http_method || 'GET',
  path: overrides?.path || `/api/test/${Date.now()}`,
  request_schema: overrides?.request_schema || {
    type: 'object',
    properties: {},
  },
  response_schema: overrides?.response_schema || {
    type: 'object',
    properties: {},
  },
  parameters: overrides?.parameters || {},
  source_type: overrides?.source_type || SourceType.MANUAL,
  source_file: overrides?.source_file,
  source_line: overrides?.source_line,
  extraction_confidence: overrides?.extraction_confidence,
  current_version_id: overrides?.current_version_id,
  created_at: overrides?.created_at || new Date(),
  updated_at: overrides?.updated_at || new Date(),
});

export const createMockContractVersion = (
  contractId: string,
  version: number,
  overrides?: Partial<ContractVersion>,
): ContractVersion => ({
  id: overrides?.id || `version-${Date.now()}`,
  contract_id: contractId,
  version,
  snapshot: overrides?.snapshot || {
    name: 'Test Contract',
    http_method: 'GET',
    path: '/api/test',
  },
  change_summary: overrides?.change_summary,
  is_current: overrides?.is_current ?? false,
  created_at: overrides?.created_at || new Date(),
  created_by: overrides?.created_by,
});

export const createMockServiceContractUsage = (
  consumerServiceId: string,
  contractId: string,
  overrides?: Partial<ServiceContractUsage>,
): ServiceContractUsage => ({
  id: overrides?.id || `usage-${Date.now()}`,
  consumer_service_id: consumerServiceId,
  contract_id: contractId,
  contract_version_id: overrides?.contract_version_id,
  usage_type: overrides?.usage_type || UsageType.MANUAL,
  detection_method: overrides?.detection_method || DetectionMethod.MANUAL,
  detected_at: overrides?.detected_at || new Date(),
  confidence: overrides?.confidence,
});

/**
 * DTO factories
 */
export const createMockCreateSystemDto = (
  overrides?: Partial<CreateSystemDto>,
): CreateSystemDto => ({
  name: overrides?.name || `Test System ${Date.now()}`,
  description: overrides?.description,
});

export const createMockCreateServiceDto = (
  systemId: string,
  overrides?: Partial<CreateServiceDto>,
): CreateServiceDto => ({
  system_id: systemId,
  name: overrides?.name || `Test Service ${Date.now()}`,
  repository_url:
    overrides?.repository_url || `https://github.com/test/service-${Date.now()}`,
  metadata: overrides?.metadata,
});

export const createMockCreateContractDto = (
  serviceId: string,
  overrides?: Partial<CreateContractDto>,
): CreateContractDto => ({
  service_id: serviceId,
  name: overrides?.name || `Test Contract ${Date.now()}`,
  http_method: overrides?.http_method || 'GET',
  path: overrides?.path || `/api/test/${Date.now()}`,
  request_schema: overrides?.request_schema,
  response_schema: overrides?.response_schema,
  parameters: overrides?.parameters,
  source_type: overrides?.source_type || SourceType.MANUAL,
  source_file: overrides?.source_file,
  source_line: overrides?.source_line,
  extraction_confidence: overrides?.extraction_confidence,
});

/**
 * Helper to create arrays of mock data
 */
export const createMockSystems = (count: number): System[] =>
  Array.from({ length: count }, (_, i) =>
    createMockSystem({ name: `Test System ${i + 1}` }),
  );

export const createMockServices = (
  systemId: string,
  count: number,
): Service[] =>
  Array.from({ length: count }, (_, i) =>
    createMockService(systemId, { name: `Test Service ${i + 1}` }),
  );

export const createMockContracts = (
  serviceId: string,
  count: number,
): Contract[] =>
  Array.from({ length: count }, (_, i) =>
    createMockContract(serviceId, { name: `Test Contract ${i + 1}` }),
  );

