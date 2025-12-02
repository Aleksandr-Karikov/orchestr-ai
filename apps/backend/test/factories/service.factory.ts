import { Service } from "../../src/database/entities/service.entity";
import { System } from "../../src/database/entities/system.entity";
import { IndexingStatus } from "../../src/database/entities/indexing-status.enum";

/**
 * Factory for creating test Service entities
 */
export class ServiceFactory {
  /**
   * Creates a Service entity with default or custom values
   */
  static create(system: System, overrides?: Partial<Service>): Service {
    const service = new Service();
    service.system = system;
    service.name = overrides?.name || `Test Service ${Date.now()}`;
    service.repository_url =
      overrides?.repository_url ||
      `https://github.com/test/service-${Date.now()}`;
    service.repository_path = overrides?.repository_path;
    service.last_indexed_at = overrides?.last_indexed_at;
    service.indexing_status =
      overrides?.indexing_status || IndexingStatus.PENDING;
    service.metadata = overrides?.metadata || {};
    service.contracts = overrides?.contracts || [];
    service.contractUsages = overrides?.contractUsages || [];

    if (overrides?.id) {
      service.id = overrides.id;
    }

    return service;
  }

  /**
   * Creates multiple Service entities for the same system
   */
  static createMany(
    system: System,
    count: number,
    overrides?: Partial<Service>,
  ): Service[] {
    return Array.from({ length: count }, () => this.create(system, overrides));
  }
}
