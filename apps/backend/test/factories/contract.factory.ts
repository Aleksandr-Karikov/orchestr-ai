import { Contract } from "../../src/database/entities/contract.entity";
import { Service } from "../../src/database/entities/service.entity";
import { SourceType } from "../../src/database/entities/source-type.enum";

/**
 * Factory for creating test Contract entities
 */
export class ContractFactory {
  /**
   * Creates a Contract entity with default or custom values
   */
  static create(service: Service, overrides?: Partial<Contract>): Contract {
    const contract = new Contract();
    contract.service = service;
    contract.name = overrides?.name || `Test Contract ${Date.now()}`;
    contract.http_method = overrides?.http_method || "GET";
    contract.path = overrides?.path || `/api/test/${Date.now()}`;
    contract.request_schema = overrides?.request_schema || {
      type: "object",
      properties: {},
    };
    contract.response_schema = overrides?.response_schema || {
      type: "object",
      properties: {},
    };
    contract.parameters = overrides?.parameters || {};
    contract.source_type = overrides?.source_type || SourceType.MANUAL;
    contract.source_file = overrides?.source_file;
    contract.source_line = overrides?.source_line;
    contract.extraction_confidence = overrides?.extraction_confidence;
    contract.currentVersion = overrides?.currentVersion;
    contract.created_at = overrides?.created_at || new Date();
    contract.updated_at = overrides?.updated_at || new Date();
    contract.versions = overrides?.versions || [];
    contract.usages = overrides?.usages || [];

    if (overrides?.id) {
      contract.id = overrides.id;
    }

    return contract;
  }

  /**
   * Creates multiple Contract entities for the same service
   */
  static createMany(
    service: Service,
    count: number,
    overrides?: Partial<Contract>,
  ): Contract[] {
    return Array.from({ length: count }, () => this.create(service, overrides));
  }
}
