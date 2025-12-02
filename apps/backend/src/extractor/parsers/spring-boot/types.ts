import { SourceType } from "@orchestr-ai/shared";

/**
 * Extracted contract information from Spring Boot annotations
 */
export interface ExtractedContract {
  name: string;
  httpMethod: string;
  path: string;
  requestSchema?: Record<string, unknown>;
  responseSchema?: Record<string, unknown>;
  parameters?: {
    path?: Record<string, ParameterInfo>;
    query?: Record<string, ParameterInfo>;
    header?: Record<string, ParameterInfo>;
    cookie?: Record<string, ParameterInfo>;
    body?: ParameterInfo;
  };
  sourceFile: string;
  sourceLine?: number;
  sourceType: SourceType;
  extractionConfidence?: number;
}

/**
 * Parameter information
 */
export interface ParameterInfo {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
  description?: string;
}

/**
 * DTO class information for schema generation
 */
export interface DtoClassInfo {
  className: string;
  packageName: string;
  fields: DtoFieldInfo[];
  filePath: string;
}

/**
 * DTO field information
 */
export interface DtoFieldInfo {
  name: string;
  type: string;
  required?: boolean;
  annotations?: string[];
  nestedType?: DtoClassInfo;
}

/**
 * Controller class information
 */
export interface ControllerInfo {
  className: string;
  packageName: string;
  basePath?: string;
  methods: ControllerMethodInfo[];
  filePath: string;
}

/**
 * Controller method information
 */
export interface ControllerMethodInfo {
  name: string;
  httpMethod: string;
  path: string;
  parameters: MethodParameterInfo[];
  returnType: string;
  lineNumber?: number;
}

/**
 * Method parameter information
 */
export interface MethodParameterInfo {
  name: string;
  type: string;
  annotation:
    | "PathVariable"
    | "RequestParam"
    | "RequestBody"
    | "RequestHeader"
    | "CookieValue";
  required?: boolean;
  defaultValue?: string;
  pathVariableName?: string; // For @PathVariable, the name in the path
}
