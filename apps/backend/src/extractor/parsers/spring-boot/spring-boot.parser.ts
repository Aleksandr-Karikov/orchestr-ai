import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { parse } from "java-parser";
import { Logger } from "../../../logger/logger.service";
import { SourceType } from "@orchestr-ai/shared";
import {
  ControllerInfo,
  ControllerMethodInfo,
  ExtractedContract,
  MethodParameterInfo,
} from "./types";
import { DtoSchemaGenerator } from "./dto-schema.generator";

@Injectable()
export class SpringBootParser {
  private readonly dtoSchemaGenerator: DtoSchemaGenerator;
  private currentRepositoryPath: string = "";

  constructor(private readonly logger: Logger) {
    this.dtoSchemaGenerator = new DtoSchemaGenerator();
  }

  /**
   * Extract contracts from a repository directory
   * @param repositoryPath Path to the cloned repository
   * @returns Array of extracted contracts
   */
  async extractContracts(repositoryPath: string): Promise<ExtractedContract[]> {
    this.currentRepositoryPath = repositoryPath;
    const contracts: ExtractedContract[] = [];
    const javaFiles = this.findJavaFiles(repositoryPath);

    for (const filePath of javaFiles) {
      try {
        const fileContracts = await this.parseFile(filePath, repositoryPath);
        contracts.push(...fileContracts);
      } catch (error) {
        // Partial extraction: continue with other files on error
        this.logger.error(
          {
            file: filePath,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
          `Failed to parse file: ${filePath}`,
        );
      }
    }

    return contracts;
  }

  /**
   * Find all Java files in the repository
   */
  private findJavaFiles(repositoryPath: string): string[] {
    const javaFiles: string[] = [];

    const walkDir = (dir: string): void => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          // Skip common directories that don't contain source code
          if (
            entry.isDirectory() &&
            (entry.name === "node_modules" ||
              entry.name === ".git" ||
              entry.name === "target" ||
              entry.name === "build" ||
              entry.name === ".idea" ||
              entry.name === ".vscode")
          ) {
            continue;
          }

          if (entry.isFile() && entry.name.endsWith(".java")) {
            javaFiles.push(fullPath);
          } else if (entry.isDirectory()) {
            walkDir(fullPath);
          }
        }
      } catch (error) {
        this.logger.warn(
          {
            directory: dir,
            error: error instanceof Error ? error.message : String(error),
          },
          `Failed to read directory: ${dir}`,
        );
      }
    };

    walkDir(repositoryPath);
    return javaFiles;
  }

  /**
   * Parse a single Java file and extract contracts
   */
  private async parseFile(
    filePath: string,
    repositoryPath: string,
  ): Promise<ExtractedContract[]> {
    const content = fs.readFileSync(filePath, "utf-8");
    const relativePath = path.relative(repositoryPath, filePath);

    try {
      // Try AST-based parsing first, fallback to regex if it fails
      let controller: ControllerInfo | null = null;
      try {
        const ast = parse(content);
        controller = this.extractController(ast, filePath, content);
      } catch (astError) {
        // If AST parsing fails, fall back to regex-based parsing
        this.logger.debug(
          `AST parsing failed, using regex fallback for: ${relativePath}. Error: ${astError instanceof Error ? astError.message : String(astError)}`,
          "SpringBootParser",
        );
        controller = this.extractControllerFromContent(content, filePath);
      }

      if (!controller) {
        return [];
      }

      return this.extractContractsFromController(controller, relativePath);
    } catch (error) {
      // Log parse error with file and line number if available
      const lineNumber = this.extractLineNumberFromError(error);
      this.logger.error(
        {
          file: relativePath,
          line: lineNumber,
          error: error instanceof Error ? error.message : String(error),
        },
        `Failed to parse Java file: ${relativePath}`,
      );
      throw error;
    }
  }

  /**
   * Extract controller information from AST
   * Falls back to regex-based parsing if AST parsing is not available or fails
   */
  private extractController(
    ast: any,
    filePath: string,
    content: string,
  ): ControllerInfo | null {
    // TODO: Implement full AST-based parsing for better accuracy
    // For now, use regex-based approach as the AST structure from java-parser
    // needs to be properly traversed to extract controller information
    // This is a placeholder that will be enhanced with proper AST traversal
    return this.extractControllerFromContent(content, filePath);
  }

  /**
   * Extract controller using regex (fallback method)
   * This will be replaced with proper AST parsing
   */
  private extractControllerFromContent(
    content: string,
    filePath: string,
  ): ControllerInfo | null {
    // Check if class has @RestController or @Controller annotation
    const hasRestController = /@RestController/.test(content);
    const hasController = /@Controller/.test(content);

    if (!hasRestController && !hasController) {
      return null;
    }

    // Extract class name
    const classMatch = content.match(/public\s+class\s+(\w+)/);
    if (!classMatch) {
      return null;
    }

    const className = classMatch[1];

    // Extract package name
    const packageMatch = content.match(/package\s+([\w.]+);/);
    const packageName = packageMatch ? packageMatch[1] : "";

    // Extract base path from @RequestMapping
    // Support both @RequestMapping("/path") and @RequestMapping(value = "/path")
    const requestMappingMatch =
      content.match(/@RequestMapping\s*\(["']([^"']+)["']/) ||
      content.match(/@RequestMapping\s*\([^)]*value\s*=\s*["']([^"']+)["']/);
    const basePath = requestMappingMatch ? requestMappingMatch[1] : "";

    // Extract methods
    const methods = this.extractMethods(content);

    return {
      className,
      packageName,
      basePath,
      methods,
      filePath,
    };
  }

  /**
   * Extract HTTP methods from controller class
   */
  private extractMethods(content: string): ControllerMethodInfo[] {
    const methods: ControllerMethodInfo[] = [];
    const lines = content.split("\n");

    // Find all methods with HTTP annotations
    const httpAnnotations = [
      "GetMapping",
      "PostMapping",
      "PutMapping",
      "DeleteMapping",
      "PatchMapping",
      "RequestMapping",
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip @RequestMapping on class level (it's handled as basePath)
      if (line.includes("@RequestMapping") && line.includes("class")) {
        continue;
      }

      for (const annotation of httpAnnotations) {
        if (line.includes(`@${annotation}`)) {
          // Skip @RequestMapping if it's not a method-level annotation
          if (annotation === "RequestMapping") {
            // Check if this is on a class declaration line
            const nextLines = lines.slice(i, Math.min(i + 5, lines.length));
            const isClassLevel = nextLines.some((l) => l.includes("class"));
            if (isClassLevel) {
              continue;
            }
          }

          const method = this.extractMethodFromAnnotation(
            annotation,
            lines,
            i,
            content,
          );
          if (method) {
            methods.push(method);
          }
        }
      }
    }

    return methods;
  }

  /**
   * Extract method information from annotation
   */
  private extractMethodFromAnnotation(
    annotation: string,
    lines: string[],
    annotationLineIndex: number,
    content: string,
  ): ControllerMethodInfo | null {
    // Extract HTTP method
    let httpMethod = "GET";
    if (annotation === "PostMapping") httpMethod = "POST";
    else if (annotation === "PutMapping") httpMethod = "PUT";
    else if (annotation === "DeleteMapping") httpMethod = "DELETE";
    else if (annotation === "PatchMapping") httpMethod = "PATCH";
    else if (annotation === "RequestMapping") {
      // Extract method from @RequestMapping
      const methodMatch = lines[annotationLineIndex].match(
        /method\s*=\s*RequestMethod\.(\w+)/,
      );
      if (methodMatch) {
        httpMethod = methodMatch[1].toUpperCase();
      }
    }

    // Extract path from annotation
    // @GetMapping("/path") or @GetMapping(value = "/path") or @GetMapping (no path = empty string)
    const annotationLine = lines[annotationLineIndex];
    let methodPath = "";

    // Check if annotation has parentheses with content
    if (annotationLine.includes("(") && annotationLine.includes(")")) {
      const pathMatch =
        annotationLine.match(/["']([^"']+)["']/) ||
        annotationLine.match(/value\s*=\s*["']([^"']+)["']/);
      methodPath = pathMatch ? pathMatch[1] : "";
    }
    // If annotation is just @GetMapping without parentheses, path is empty (uses base path)

    // Find method signature (may span multiple lines)
    let methodSignature = "";
    let methodName = "";
    let lineNumber = annotationLineIndex + 1;
    let parenCount = 0;
    let foundStart = false;

    for (
      let i = annotationLineIndex + 1;
      i < Math.min(annotationLineIndex + 20, lines.length);
      i++
    ) {
      const line = lines[i];

      if (!foundStart && line.match(/public\s+\w+.*\(/)) {
        foundStart = true;
        methodSignature = line;
        const nameMatch = line.match(/(\w+)\s*\(/);
        methodName = nameMatch ? nameMatch[1] : "unknown";
        lineNumber = i + 1;

        // Count parentheses to find the end of the parameter list
        parenCount =
          (line.match(/\(/g)?.length || 0) - (line.match(/\)/g)?.length || 0);

        if (parenCount === 0) {
          // Single-line method signature
          break;
        }
      } else if (foundStart) {
        // Continue collecting lines until we find the closing parenthesis
        methodSignature += " " + line.trim();
        parenCount +=
          (line.match(/\(/g)?.length || 0) - (line.match(/\)/g)?.length || 0);

        if (parenCount === 0) {
          // Found the end of the parameter list
          break;
        }
      }
    }

    // Extract parameters
    const parameters = this.extractParameters(methodSignature, content);

    // Extract return type
    const returnTypeMatch = methodSignature.match(
      /public\s+(\w+(?:<\w+>)?)\s+/,
    );
    const returnType = returnTypeMatch ? returnTypeMatch[1] : "void";

    return {
      name: methodName,
      httpMethod,
      path: methodPath,
      parameters,
      returnType,
      lineNumber,
    };
  }

  /**
   * Extract parameters from method signature
   */
  private extractParameters(
    methodSignature: string,
    _content: string,
  ): MethodParameterInfo[] {
    const parameters: MethodParameterInfo[] = [];

    // Extract parameter list from method signature (handle multi-line)
    // Find the opening parenthesis after the method name and extract until matching closing paren
    const methodNameMatch = methodSignature.match(/(\w+)\s*\(/);
    if (!methodNameMatch) {
      return parameters;
    }

    const methodNamePos = methodSignature.indexOf(methodNameMatch[0]);
    const paramStart = methodNamePos + methodNameMatch[0].length - 1; // Position of opening (

    // Find matching closing parenthesis by counting nested parentheses
    let parenCount = 0;
    let paramEnd = -1;
    for (let i = paramStart; i < methodSignature.length; i++) {
      if (methodSignature[i] === "(") parenCount++;
      if (methodSignature[i] === ")") {
        parenCount--;
        if (parenCount === 0) {
          paramEnd = i;
          break;
        }
      }
    }

    if (paramEnd === -1) {
      return parameters;
    }

    let paramString = methodSignature
      .substring(paramStart + 1, paramEnd)
      .trim();
    if (!paramString) {
      return parameters;
    }

    // Normalize whitespace - replace newlines and multiple spaces with single space
    paramString = paramString.replace(/\s+/g, " ").trim();

    // Split parameters by comma, but be careful with generics and annotations
    // Pattern: @Annotation Type name, @Annotation Type name
    // Updated regex to capture full annotation including parentheses: @RequestParam(required = false)
    // Match annotation with optional parentheses: @RequestParam or @RequestParam(required = false)
    const paramRegex = /(@\w+(?:\([^)]+\))?)\s+(\w+(?:<\w+>)?)\s+(\w+)(?=,|$)/g;
    let match;

    while ((match = paramRegex.exec(paramString)) !== null) {
      const annotation = (match[1] || "").trim();
      const type = match[2];
      const name = match[3];

      let paramAnnotation: MethodParameterInfo["annotation"] | null = null;
      let required = true;
      let defaultValue: string | undefined;
      let pathVariableName: string | undefined;

      if (annotation.includes("@PathVariable")) {
        paramAnnotation = "PathVariable";
        // Extract name from @PathVariable(name = "id") or @PathVariable("id")
        const nameMatch = annotation.match(/["'](\w+)["']/);
        pathVariableName = nameMatch ? nameMatch[1] : name;
        required = true; // PathVariable is always required
      } else if (annotation.includes("@RequestParam")) {
        paramAnnotation = "RequestParam";
        // Check for required = false (use regex to match properly)
        // @RequestParam(required = false) or @RequestParam String name (defaults to true)
        if (/required\s*=\s*false/.test(annotation)) {
          required = false;
        } else {
          required = true; // Default for @RequestParam is true
        }
        // Extract defaultValue
        const defaultValueMatch = annotation.match(
          /defaultValue\s*=\s*["']([^"']+)["']/,
        );
        defaultValue = defaultValueMatch ? defaultValueMatch[1] : undefined;
      } else if (annotation.includes("@RequestBody")) {
        paramAnnotation = "RequestBody";
        required = true; // RequestBody is always required
      } else if (annotation.includes("@RequestHeader")) {
        paramAnnotation = "RequestHeader";
        // Check for required = false
        if (/required\s*=\s*false/.test(annotation)) {
          required = false;
        } else {
          required = true; // Default for @RequestHeader is true
        }
      } else if (annotation.includes("@CookieValue")) {
        paramAnnotation = "CookieValue";
        // Check for required = false
        if (/required\s*=\s*false/.test(annotation)) {
          required = false;
        } else {
          required = true; // Default for @CookieValue is true
        }
      }

      if (paramAnnotation) {
        parameters.push({
          name,
          type,
          annotation: paramAnnotation,
          required, // Always explicitly set
          defaultValue,
          pathVariableName,
        });
      }
    }

    return parameters;
  }

  /**
   * Extract contracts from controller information
   */
  private extractContractsFromController(
    controller: ControllerInfo,
    relativePath: string,
  ): ExtractedContract[] {
    const contracts: ExtractedContract[] = [];

    for (const method of controller.methods) {
      try {
        const contract = this.buildContract(controller, method, relativePath);
        contracts.push(contract);
      } catch (error) {
        // Partial extraction: continue with other methods on error
        this.logger.warn(
          {
            file: relativePath,
            line: method.lineNumber,
            method: method.name,
            error: error instanceof Error ? error.message : String(error),
          },
          `Failed to extract contract from method: ${method.name}`,
        );
      }
    }

    return contracts;
  }

  /**
   * Build contract from controller and method information
   */
  private buildContract(
    controller: ControllerInfo,
    method: ControllerMethodInfo,
    relativePath: string,
  ): ExtractedContract {
    // Combine base path and method path
    let fullPath = "";

    // Start with base path if it exists
    if (controller.basePath) {
      fullPath = controller.basePath.endsWith("/")
        ? controller.basePath.slice(0, -1)
        : controller.basePath;
    }

    // Add method path if it exists
    if (method.path) {
      const methodPath = method.path.startsWith("/")
        ? method.path
        : `/${method.path}`;
      fullPath = fullPath ? `${fullPath}${methodPath}` : methodPath;
    } else if (!fullPath) {
      // If no base path and no method path, use root
      fullPath = "/";
    }
    // If we have base path but no method path, fullPath is already set to basePath

    // Build parameters object
    const parameters: ExtractedContract["parameters"] = {};
    for (const param of method.parameters) {
      switch (param.annotation) {
        case "PathVariable":
          if (!parameters.path) parameters.path = {};
          parameters.path[param.pathVariableName || param.name] = {
            name: param.pathVariableName || param.name,
            type: param.type,
            required: param.required ?? true,
          };
          break;
        case "RequestParam": {
          if (!parameters.query) parameters.query = {};
          // RequestParam is required by default unless explicitly set to false
          // param.required should always be set (true or false) from extractParameters
          // Use the required value directly, defaulting to true if undefined
          const isRequired = param.required ?? true;
          parameters.query[param.name] = {
            name: param.name,
            type: param.type,
            required: isRequired,
            defaultValue: param.defaultValue,
          };
          break;
        }
        case "RequestBody":
          parameters.body = {
            name: param.name,
            type: param.type,
            required: param.required ?? true,
          };
          break;
        case "RequestHeader":
          if (!parameters.header) parameters.header = {};
          parameters.header[param.name] = {
            name: param.name,
            type: param.type,
            required: param.required ?? true,
          };
          break;
        case "CookieValue":
          if (!parameters.cookie) parameters.cookie = {};
          parameters.cookie[param.name] = {
            name: param.name,
            type: param.type,
            required: param.required ?? true,
          };
          break;
      }
    }

    // Generate contract name
    const contractName = `${method.httpMethod} ${fullPath}`.replace(
      /[^a-zA-Z0-9]/g,
      "",
    );

    // Generate request schema from @RequestBody parameter
    let requestSchema: Record<string, unknown> | undefined;
    if (parameters.body) {
      const bodyType = parameters.body.type;
      // Extract class name from type (handle generics like List<UserDto>)
      const classNameMatch = bodyType.match(/(\w+)(?:<.*>)?/);
      if (classNameMatch) {
        const className = classNameMatch[1];
        requestSchema = this.dtoSchemaGenerator.generateSchema(
          className,
          this.currentRepositoryPath,
          controller.packageName,
        );
      }
    }

    // Generate response schema from return type
    let responseSchema: Record<string, unknown> | undefined;
    if (method.returnType && method.returnType !== "void") {
      // Handle ResponseEntity<T> - extract T
      const responseTypeMatch = method.returnType.match(
        /ResponseEntity<(\w+)>/,
      );
      const actualReturnType = responseTypeMatch
        ? responseTypeMatch[1]
        : method.returnType;

      // Extract class name
      const classNameMatch = actualReturnType.match(/(\w+)(?:<.*>)?/);
      if (classNameMatch) {
        const className = classNameMatch[1];
        responseSchema = this.dtoSchemaGenerator.generateSchema(
          className,
          this.currentRepositoryPath,
          controller.packageName,
        );
      }
    }

    return {
      name: contractName,
      httpMethod: method.httpMethod,
      path: fullPath,
      parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
      requestSchema,
      responseSchema,
      sourceFile: relativePath,
      sourceLine: method.lineNumber,
      sourceType: SourceType.ANNOTATION,
      extractionConfidence: 0.8, // High confidence for annotation-based extraction
    };
  }

  /**
   * Extract line number from error if available
   */
  private extractLineNumberFromError(error: unknown): number | undefined {
    if (error instanceof Error && error.message) {
      const lineMatch = error.message.match(/line\s+(\d+)/i);
      if (lineMatch) {
        return parseInt(lineMatch[1], 10);
      }
    }
    return undefined;
  }
}
