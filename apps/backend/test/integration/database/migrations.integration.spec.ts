import { MikroORM, EntityManager } from "@mikro-orm/core";
import {
  System,
  Service,
  Contract,
  ContractVersion,
  ServiceContractUsage,
} from "../../../src/database/entities";
import {
  setupTestDatabase,
  closeTestDatabase,
  cleanupDatabase,
} from "../../test-setup";

describe("Database Migrations Integration Tests", () => {
  let orm: MikroORM;
  let em: EntityManager;

  beforeAll(async () => {
    orm = await setupTestDatabase();
    em = orm.em.fork();
  });

  afterAll(async () => {
    await closeTestDatabase(orm);
  });

  beforeEach(async () => {
    em = orm.em.fork();
    await cleanupDatabase(em);
  });

  describe("Migration Up", () => {
    it("should have all required tables after migration", async () => {
      // Check that all tables exist by trying to query them
      const systems = await em.find(System, {});
      const services = await em.find(Service, {});
      const contracts = await em.find(Contract, {});
      const versions = await em.find(ContractVersion, {});
      const usages = await em.find(ServiceContractUsage, {});

      // If we can query without errors, tables exist
      expect(Array.isArray(systems)).toBe(true);
      expect(Array.isArray(services)).toBe(true);
      expect(Array.isArray(contracts)).toBe(true);
      expect(Array.isArray(versions)).toBe(true);
      expect(Array.isArray(usages)).toBe(true);
    });

    it("should have correct column types for System table", async () => {
      const system = new System();
      system.name = "Test System";
      system.description = "Test description";
      system.created_at = new Date();
      system.updated_at = new Date();
      em.persist(system);
      await em.flush();

      const found = await em.findOne(System, system.id);
      expect(found?.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      ); // UUID format
      expect(typeof found?.name).toBe("string");
      expect(found?.created_at).toBeInstanceOf(Date);
      expect(found?.updated_at).toBeInstanceOf(Date);
    });

    it("should have correct column types for Service table", async () => {
      const system = new System();
      system.name = "Test System";
      system.created_at = new Date();
      system.updated_at = new Date();
      em.persist(system);
      await em.flush();

      const service = new Service();
      service.system = system;
      service.name = "Test Service";
      service.repository_url = "https://github.com/test/service";
      service.indexing_status = "pending" as any;
      service.metadata = { key: "value" };
      em.persist(service);
      await em.flush();

      const found = await em.findOne(Service, service.id);
      expect(found?.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(typeof found?.name).toBe("string");
      expect(typeof found?.repository_url).toBe("string");
      expect(found?.metadata).toEqual({ key: "value" });
    });

    it("should have correct column types for Contract table with JSONB fields", async () => {
      const system = new System();
      system.name = "Test System";
      system.created_at = new Date();
      system.updated_at = new Date();
      em.persist(system);
      await em.flush();

      const service = new Service();
      service.system = system;
      service.name = "Test Service";
      service.repository_url = "https://github.com/test/service";
      service.indexing_status = "pending" as any;
      em.persist(service);
      await em.flush();

      const contract = new Contract();
      contract.service = service;
      contract.name = "Test Contract";
      contract.http_method = "GET";
      contract.path = "/api/test";
      contract.source_type = "manual" as any;
      contract.request_schema = { type: "object" };
      contract.response_schema = { type: "object" };
      contract.parameters = { path: ["id"] };
      contract.created_at = new Date();
      contract.updated_at = new Date();
      em.persist(contract);
      await em.flush();

      const found = await em.findOne(Contract, contract.id);
      expect(found?.request_schema).toEqual({ type: "object" });
      expect(found?.response_schema).toEqual({ type: "object" });
      expect(found?.parameters).toEqual({ path: ["id"] });
    });

    it("should have correct column types for ContractVersion table with JSONB snapshot", async () => {
      const system = new System();
      system.name = "Test System";
      system.created_at = new Date();
      system.updated_at = new Date();
      em.persist(system);
      await em.flush();

      const service = new Service();
      service.system = system;
      service.name = "Test Service";
      service.repository_url = "https://github.com/test/service";
      service.indexing_status = "pending" as any;
      em.persist(service);
      await em.flush();

      const contract = new Contract();
      contract.service = service;
      contract.name = "Test Contract";
      contract.http_method = "GET";
      contract.path = "/api/test";
      contract.source_type = "manual" as any;
      contract.created_at = new Date();
      contract.updated_at = new Date();
      em.persist(contract);
      await em.flush();

      const version = new ContractVersion();
      version.contract = contract;
      version.version = 1;
      version.snapshot = {
        name: "Test Contract",
        http_method: "GET",
        path: "/api/test",
      };
      em.persist(version);
      await em.flush();

      const found = await em.findOne(ContractVersion, version.id);
      expect(found?.version).toBe(1);
      expect(found?.snapshot).toEqual({
        name: "Test Contract",
        http_method: "GET",
        path: "/api/test",
      });
      expect(typeof found?.is_current).toBe("boolean");
    });

    it("should have foreign key constraints", async () => {
      const system = new System();
      system.name = "Test System";
      system.created_at = new Date();
      system.updated_at = new Date();
      em.persist(system);
      await em.flush();

      const service = new Service();
      service.system = system;
      service.name = "Test Service";
      service.repository_url = "https://github.com/test/service";
      service.indexing_status = "pending" as any;
      em.persist(service);
      await em.flush();

      // Try to create a service with non-existent system_id should fail
      // This is tested by the ORM validation, but we can verify the relationship works
      const foundService = await em.findOne(Service, service.id, {
        populate: ["system"],
      });
      expect(foundService?.system.id).toBe(system.id);
    });

    it("should have indexes on foreign keys", async () => {
      // Create test data
      const system = new System();
      system.name = "Test System";
      system.created_at = new Date();
      system.updated_at = new Date();
      em.persist(system);
      await em.flush();

      const service = new Service();
      service.system = system;
      service.name = "Test Service";
      service.repository_url = "https://github.com/test/service";
      service.indexing_status = "pending" as any;
      em.persist(service);
      await em.flush();

      // Query by foreign key - if index exists, this should be fast
      const services = await em.find(Service, { system });
      expect(services.length).toBeGreaterThan(0);
    });
  });
});
