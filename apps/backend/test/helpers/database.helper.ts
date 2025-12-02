import { EntityManager } from "@mikro-orm/core";
import {
  System,
  Service,
  Contract,
  ContractVersion,
  ServiceContractUsage,
} from "../../src/database/entities";

/**
 * Database helper utilities for tests
 */
export class DatabaseHelper {
  /**
   * Creates a complete test scenario with system, service, and contract
   */
  static async createTestScenario(em: EntityManager): Promise<{
    system: System;
    service: Service;
    contract: Contract;
  }> {
    const now = new Date();
    const system = new System();
    system.name = `Test System ${Date.now()}`;
    system.description = "Test system";
    system.created_at = now;
    system.updated_at = now;
    em.persist(system);

    const service = new Service();
    service.system = system;
    service.name = `Test Service ${Date.now()}`;
    service.repository_url = "https://github.com/test/service";
    service.indexing_status = "pending" as any;
    em.persist(service);

    const contract = new Contract();
    contract.service = service;
    contract.name = `Test Contract ${Date.now()}`;
    contract.http_method = "GET";
    contract.path = "/api/test";
    contract.source_type = "manual" as any;
    contract.created_at = now;
    contract.updated_at = now;
    em.persist(contract);

    await em.flush();

    return { system, service, contract };
  }

  /**
   * Creates a test scenario with contract version
   */
  static async createTestScenarioWithVersion(em: EntityManager): Promise<{
    system: System;
    service: Service;
    contract: Contract;
    version: ContractVersion;
  }> {
    const scenario = await this.createTestScenario(em);

    const version = new ContractVersion();
    version.contract = scenario.contract;
    version.version = 1;
    version.snapshot = {
      name: scenario.contract.name,
      http_method: scenario.contract.http_method,
      path: scenario.contract.path,
    };
    version.is_current = true;
    em.persist(version);

    scenario.contract.currentVersion = version;
    em.persist(scenario.contract);

    await em.flush();

    return { ...scenario, version };
  }

  /**
   * Creates a test scenario with service contract usage
   */
  static async createTestScenarioWithUsage(em: EntityManager): Promise<{
    system: System;
    providerService: Service;
    consumerService: Service;
    contract: Contract;
    usage: ServiceContractUsage;
  }> {
    const now = new Date();
    const system = new System();
    system.name = `Test System ${Date.now()}`;
    system.description = "Test system";
    system.created_at = now;
    system.updated_at = now;
    em.persist(system);

    const providerService = new Service();
    providerService.system = system;
    providerService.name = `Provider Service ${Date.now()}`;
    providerService.repository_url = "https://github.com/test/provider";
    providerService.indexing_status = "pending" as any;
    em.persist(providerService);

    const consumerService = new Service();
    consumerService.system = system;
    consumerService.name = `Consumer Service ${Date.now()}`;
    consumerService.repository_url = "https://github.com/test/consumer";
    consumerService.indexing_status = "pending" as any;
    em.persist(consumerService);

    const contract = new Contract();
    contract.service = providerService;
    contract.name = `Test Contract ${Date.now()}`;
    contract.http_method = "GET";
    contract.path = "/api/test";
    contract.source_type = "manual" as any;
    contract.created_at = now;
    contract.updated_at = now;
    em.persist(contract);

    const usage = new ServiceContractUsage();
    usage.consumerService = consumerService;
    usage.contract = contract;
    usage.usage_type = "manual" as any;
    usage.detection_method = "manual" as any;
    em.persist(usage);

    await em.flush();

    return {
      system,
      providerService,
      consumerService,
      contract,
      usage,
    };
  }

  /**
   * Asserts that an entity exists in the database
   */
  static async assertEntityExists<T>(
    em: EntityManager,
    entityClass: new () => T,
    id: string,
  ): Promise<T> {
    const entity = await em.findOne(entityClass, id);
    if (!entity) {
      throw new Error(
        `Entity ${entityClass.name} with id ${id} not found in database`,
      );
    }
    return entity;
  }

  /**
   * Asserts that an entity does not exist in the database
   */
  static async assertEntityNotExists<T>(
    em: EntityManager,
    entityClass: new () => T,
    id: string,
  ): Promise<void> {
    const entity = await em.findOne(entityClass, id);
    if (entity) {
      throw new Error(
        `Entity ${entityClass.name} with id ${id} should not exist in database`,
      );
    }
  }
}
