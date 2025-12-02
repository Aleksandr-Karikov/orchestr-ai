import * as fs from "fs";
import * as path from "path";
import { DtoClassInfo, DtoFieldInfo } from "./types";

/**
 * Generates JSON Schema from DTO classes
 */
export class DtoSchemaGenerator {
  /**
   * Generate JSON Schema from a DTO class name
   * @param dtoClassName Name of the DTO class
   * @param repositoryPath Path to the repository
   * @param packageName Package name of the DTO class
   * @returns JSON Schema object or undefined if not found
   */
  generateSchema(
    dtoClassName: string,
    repositoryPath: string,
    packageName?: string,
  ): Record<string, unknown> | undefined {
    const dtoInfo = this.findDtoClass(
      dtoClassName,
      repositoryPath,
      packageName,
    );
    if (!dtoInfo) {
      return undefined;
    }

    return this.dtoToJsonSchema(dtoInfo);
  }

  /**
   * Find DTO class in repository
   */
  private findDtoClass(
    className: string,
    repositoryPath: string,
    packageName?: string,
  ): DtoClassInfo | undefined {
    // Search for Java files matching the class name
    const javaFiles = this.findJavaFiles(repositoryPath);

    for (const filePath of javaFiles) {
      const content = fs.readFileSync(filePath, "utf-8");

      // Check if this file contains the class
      const classRegex = new RegExp(`class\\s+${className}\\s*[\\{<]`);
      if (!classRegex.test(content)) {
        continue;
      }

      // Check package name if provided
      if (packageName) {
        const filePackageMatch = content.match(/package\s+([\w.]+);/);
        if (!filePackageMatch || filePackageMatch[1] !== packageName) {
          continue;
        }
      }

      // Extract DTO information
      return this.extractDtoInfo(content, filePath);
    }

    return undefined;
  }

  /**
   * Find all Java files in repository
   */
  private findJavaFiles(repositoryPath: string): string[] {
    const javaFiles: string[] = [];

    const walkDir = (dir: string): void => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (
            entry.isDirectory() &&
            (entry.name === "node_modules" ||
              entry.name === ".git" ||
              entry.name === "target" ||
              entry.name === "build")
          ) {
            continue;
          }

          if (entry.isFile() && entry.name.endsWith(".java")) {
            javaFiles.push(fullPath);
          } else if (entry.isDirectory()) {
            walkDir(fullPath);
          }
        }
      } catch {
        // Ignore errors when reading directories
      }
    };

    walkDir(repositoryPath);
    return javaFiles;
  }

  /**
   * Extract DTO information from Java file content
   */
  private extractDtoInfo(content: string, filePath: string): DtoClassInfo {
    // Extract class name
    const classMatch = content.match(/public\s+class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : "";

    // Extract package name
    const packageMatch = content.match(/package\s+([\w.]+);/);
    const packageName = packageMatch ? packageMatch[1] : "";

    // Extract fields
    const fields = this.extractFields(content);

    return {
      className,
      packageName,
      fields,
      filePath,
    };
  }

  /**
   * Extract fields from DTO class
   */
  private extractFields(content: string): DtoFieldInfo[] {
    const fields: DtoFieldInfo[] = [];

    // Match field declarations (private/protected/public Type fieldName;)
    const fieldRegex =
      /(?:private|protected|public)\s+(\w+(?:<\w+>)?)\s+(\w+)\s*[;=]/g;
    let match;

    while ((match = fieldRegex.exec(content)) !== null) {
      const type = match[1];
      const name = match[2];

      // Check if field has @NotNull or @NotBlank annotation (required)
      const fieldContext = this.getFieldContext(content, name);
      const required = this.isFieldRequired(fieldContext);

      // Extract annotations
      const annotations = this.extractFieldAnnotations(fieldContext);

      fields.push({
        name,
        type: this.normalizeType(type),
        required,
        annotations,
      });
    }

    return fields;
  }

  /**
   * Get context around a field declaration
   */
  private getFieldContext(content: string, fieldName: string): string {
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(fieldName)) {
        // Get context: 2 lines before to 2 lines after
        const start = Math.max(0, i - 2);
        const end = Math.min(lines.length, i + 3);
        return lines.slice(start, end).join("\n");
      }
    }
    return "";
  }

  /**
   * Check if field is required based on annotations
   */
  private isFieldRequired(fieldContext: string): boolean {
    return (
      /@NotNull/.test(fieldContext) ||
      /@NotBlank/.test(fieldContext) ||
      /@NotEmpty/.test(fieldContext)
    );
  }

  /**
   * Extract annotations from field context
   */
  private extractFieldAnnotations(fieldContext: string): string[] {
    const annotations: string[] = [];
    const annotationRegex = /@(\w+)/g;
    let match;

    while ((match = annotationRegex.exec(fieldContext)) !== null) {
      annotations.push(match[1]);
    }

    return annotations;
  }

  /**
   * Normalize Java type to JSON Schema type
   */
  private normalizeType(javaType: string): string {
    // Remove generics for now
    const baseType = javaType.replace(/<.*>/, "").trim();

    // Map Java types to JSON Schema types
    const typeMap: Record<string, string> = {
      String: "string",
      Integer: "integer",
      Long: "integer",
      Double: "number",
      Float: "number",
      Boolean: "boolean",
      boolean: "boolean",
      int: "integer",
      long: "integer",
      double: "number",
      float: "number",
      Date: "string", // ISO 8601 date string
      LocalDateTime: "string",
      LocalDate: "string",
      BigDecimal: "number",
    };

    return typeMap[baseType] || "object";
  }

  /**
   * Convert DTO info to JSON Schema
   */
  private dtoToJsonSchema(dtoInfo: DtoClassInfo): Record<string, unknown> {
    const properties: Record<string, Record<string, unknown>> = {};
    const required: string[] = [];

    for (const field of dtoInfo.fields) {
      const propertySchema: Record<string, unknown> = {
        type: this.normalizeType(field.type),
      };

      // Add format for date types
      if (field.type.includes("Date") || field.type.includes("LocalDateTime")) {
        propertySchema.format = "date-time";
      } else if (field.type.includes("LocalDate")) {
        propertySchema.format = "date";
      }

      properties[field.name] = propertySchema;

      if (field.required) {
        required.push(field.name);
      }
    }

    const schema: Record<string, unknown> = {
      type: "object",
      properties,
    };

    // Add required array only if not empty
    if (required.length > 0) {
      schema.required = required;
    }

    return schema;
  }
}
