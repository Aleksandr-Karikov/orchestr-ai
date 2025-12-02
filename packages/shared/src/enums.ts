/**
 * Indexing status for services
 */
export enum IndexingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Source type for contract extraction
 */
export enum SourceType {
  ANNOTATION = 'annotation',
  OPENAPI = 'openapi',
  MANUAL = 'manual',
  LLM = 'llm',
  HYBRID = 'hybrid',
}

/**
 * Usage type for service contract usage
 */
export enum UsageType {
  DIRECT_CALL = 'direct_call',
  INDIRECT = 'indirect',
  MANUAL = 'manual',
}

/**
 * Detection method for dependencies
 */
export enum DetectionMethod {
  CODE_ANALYSIS = 'code_analysis',
  CONFIG = 'config',
  MANUAL = 'manual',
}

