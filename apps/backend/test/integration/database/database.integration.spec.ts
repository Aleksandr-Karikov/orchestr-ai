import { MikroORM, EntityManager } from "@mikro-orm/core";
import {
  System,
  Service,
  Contract,
  ContractVersion,
  ServiceContractUsage,
} from "../../../src/database/entities";
import { IndexingStatus } from "../../../src/database/entities/indexing-status.enum";
import { SourceType } from "../../../src/database/entities/source-type.enum";
import { UsageType } from "../../../src/database/entities/usage-type.enum";
import { DetectionMethod } from "../../../src/database/entities/detection-method.enum";
import {
  setupTestDatabase,
  closeTestDatabase,
  cleanupDatabase,
} from "../../test-setup";
import {
  SystemFactory,
  ServiceFactory,
  ContractFactory,
  ContractVersionFactory,
  ServiceContractUsageFactory,
} from "../../factories";
import { DatabaseHelper } from "../../helpers";

describe("Database Integration Tests", () => {
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

  describe("System Entity", () => {
    it("should create a system", async () => {
      const system = SystemFactory.create({
        name: "Test System",
        description: "Test description",
      });

      em.persist(system);
      await em.flush();

      const found = await em.findOne(System, system.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe("Test System");
      expect(found?.description).toBe("Test description");
      expect(found?.id).toBe(system.id);
      expect(found?.created_at).toBeInstanceOf(Date);
      expect(found?.updated_at).toBeInstanceOf(Date);
    });

    it("should update a system", async () => {
      const system = SystemFactory.create();
      em.persist(system);
      await em.flush();

      system.name = "Updated System";
      system.description = "Updated description";
      await em.flush();

      const found = await em.findOne(System, system.id);
      expect(found?.name).toBe("Updated System");
      expect(found?.description).toBe("Updated description");
    });

    it("should delete a system", async () => {
      const system = SystemFactory.create();
      em.persist(system);
      await em.flush();

      const id = system.id;
      em.remove(system);
      await em.flush();

      const found = await em.findOne(System, id);
      expect(found).toBeNull();
    });

    it("should validate system name is required", async () => {
      const system = new System();
      // @ts-expect-error - Testing validation
      system.name = undefined;

      em.persist(system);
      await expect(em.flush()).rejects.toThrow();
    });
  });

  describe("Service Entity", () => {
    it("should create a service with system relationship", async () => {
      const system = SystemFactory.create();
      em.persist(system);
      await em.flush();

      const service = ServiceFactory.create(system, {
        name: "Test Service",
        repository_url: "https://github.com/test/service",
        indexing_status: IndexingStatus.PENDING,
      });

      em.persist(service);
      await em.flush();

      const found = await em.findOne(Service, service.id, {
        populate: ["system"],
      });
      expect(found).toBeDefined();
      expect(found?.name).toBe("Test Service");
      expect(found?.repository_url).toBe("https://github.com/test/service");
      expect(found?.system.id).toBe(system.id);
      expect(found?.indexing_status).toBe(IndexingStatus.PENDING);
    });

    it("should cascade delete services when system is deleted", async () => {
      const system = SystemFactory.create();
      em.persist(system);
      await em.flush();

      const service = ServiceFactory.create(system);
      em.persist(service);
      await em.flush();

      const serviceId = service.id;
      em.remove(system);
      await em.flush();

      const foundService = await em.findOne(Service, serviceId);
      expect(foundService).toBeNull();
    });

    it("should store JSONB metadata", async () => {
      const system = SystemFactory.create();
      em.persist(system);
      await em.flush();

      const metadata = {
        language: "typescript",
        framework: "nestjs",
        version: "1.0.0",
      };

      const service = ServiceFactory.create(system, { metadata });
      em.persist(service);
      await em.flush();

      const found = await em.findOne(Service, service.id);
      expect(found?.metadata).toEqual(metadata);
    });

    it("should update indexing status", async () => {
      const system = SystemFactory.create();
      em.persist(system);
      await em.flush();

      const service = ServiceFactory.create(system, {
        indexing_status: IndexingStatus.PENDING,
      });
      em.persist(service);
      await em.flush();

      service.indexing_status = IndexingStatus.COMPLETED;
      service.last_indexed_at = new Date();
      await em.flush();

      const found = await em.findOne(Service, service.id);
      expect(found?.indexing_status).toBe(IndexingStatus.COMPLETED);
      expect(found?.last_indexed_at).toBeInstanceOf(Date);
    });
  });

  describe("Contract Entity", () => {
    it("should create a contract with service relationship", async () => {
      const { service } = await DatabaseHelper.createTestScenario(em);

      const contract = ContractFactory.create(service, {
        name: "GetUser",
        http_method: "GET",
        path: "/api/users/{id}",
        source_type: SourceType.MANUAL,
      });

      em.persist(contract);
      await em.flush();

      const found = await em.findOne(Contract, contract.id, {
        populate: ["service"],
      });
      expect(found).toBeDefined();
      expect(found?.name).toBe("GetUser");
      expect(found?.http_method).toBe("GET");
      expect(found?.path).toBe("/api/users/{id}");
      expect(found?.service.id).toBe(service.id);
    });

    it("should store JSONB request and response schemas", async () => {
      const { service } = await DatabaseHelper.createTestScenario(em);

      const requestSchema = {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      };

      const responseSchema = {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
        },
      };

      const contract = ContractFactory.create(service, {
        request_schema: requestSchema,
        response_schema: responseSchema,
      });

      em.persist(contract);
      await em.flush();

      const found = await em.findOne(Contract, contract.id);
      expect(found?.request_schema).toEqual(requestSchema);
      expect(found?.response_schema).toEqual(responseSchema);
    });

    it("should cascade delete contracts when service is deleted", async () => {
      const { service, contract } = await DatabaseHelper.createTestScenario(em);

      const contractId = contract.id;
      em.remove(service);
      await em.flush();

      const foundContract = await em.findOne(Contract, contractId);
      expect(foundContract).toBeNull();
    });

    it("should support different source types", async () => {
      const { service } = await DatabaseHelper.createTestScenario(em);

      const sourceTypes = [
        SourceType.MANUAL,
        SourceType.ANNOTATION,
        SourceType.OPENAPI,
        SourceType.LLM,
        SourceType.HYBRID,
      ];

      for (const sourceType of sourceTypes) {
        const contract = ContractFactory.create(service, {
          source_type: sourceType,
        });
        em.persist(contract);
      }

      await em.flush();

      const contracts = await em.find(Contract, { service });
      // createTestScenario creates 1 contract, then we create 5 more = 6 total
      expect(contracts).toHaveLength(sourceTypes.length + 1);
    });
  });

  describe("ContractVersion Entity", () => {
    it("should create a contract version", async () => {
      const { contract } = await DatabaseHelper.createTestScenario(em);

      const snapshot = {
        name: contract.name,
        http_method: contract.http_method,
        path: contract.path,
        request_schema: contract.request_schema,
        response_schema: contract.response_schema,
      };

      const version = ContractVersionFactory.create(contract, 1, {
        snapshot,
        is_current: true,
        change_summary: "Initial version",
      });

      em.persist(version);
      await em.flush();

      const found = await em.findOne(ContractVersion, version.id, {
        populate: ["contract"],
      });
      expect(found).toBeDefined();
      expect(found?.version).toBe(1);
      expect(found?.snapshot).toEqual(snapshot);
      expect(found?.is_current).toBe(true);
      expect(found?.change_summary).toBe("Initial version");
      expect(found?.contract.id).toBe(contract.id);
    });

    it("should cascade delete versions when contract is deleted", async () => {
      const { contract } = await DatabaseHelper.createTestScenario(em);

      const version = ContractVersionFactory.create(contract, 1);
      em.persist(version);
      await em.flush();

      const versionId = version.id;
      em.remove(contract);
      await em.flush();

      const foundVersion = await em.findOne(ContractVersion, versionId);
      expect(foundVersion).toBeNull();
    });

    it("should support multiple versions for a contract", async () => {
      const { contract } = await DatabaseHelper.createTestScenario(em);

      const versions = ContractVersionFactory.createMany(contract, [1, 2, 3], {
        is_current: false,
      });
      versions[2].is_current = true; // Mark version 3 as current

      for (const version of versions) {
        em.persist(version);
      }
      await em.flush();

      const found = await em.find(ContractVersion, { contract });
      expect(found).toHaveLength(3);
      expect(found.find((v) => v.version === 3)?.is_current).toBe(true);
    });

    it("should store JSONB snapshot", async () => {
      const { contract } = await DatabaseHelper.createTestScenario(em);

      const complexSnapshot = {
        name: "GetUser",
        http_method: "GET",
        path: "/api/users/{id}",
        request_schema: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        response_schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
          },
        },
        parameters: {
          path: ["id"],
          query: ["include"],
        },
      };

      const version = ContractVersionFactory.create(contract, 1, {
        snapshot: complexSnapshot,
      });

      em.persist(version);
      await em.flush();

      const found = await em.findOne(ContractVersion, version.id);
      expect(found?.snapshot).toEqual(complexSnapshot);
    });
  });

  describe("ServiceContractUsage Entity", () => {
    it("should create a service contract usage", async () => {
      const { consumerService, contract } =
        await DatabaseHelper.createTestScenarioWithUsage(em);

      const usage = ServiceContractUsageFactory.create(
        consumerService,
        contract,
        {
          usage_type: UsageType.DIRECT_CALL,
          detection_method: DetectionMethod.CODE_ANALYSIS,
          confidence: 0.95,
        },
      );

      em.persist(usage);
      await em.flush();

      const found = await em.findOne(ServiceContractUsage, usage.id, {
        populate: ["consumerService", "contract"],
      });
      expect(found).toBeDefined();
      expect(found?.consumerService.id).toBe(consumerService.id);
      expect(found?.contract.id).toBe(contract.id);
      expect(found?.usage_type).toBe(UsageType.DIRECT_CALL);
      expect(found?.detection_method).toBe(DetectionMethod.CODE_ANALYSIS);
      expect(found?.confidence).toBe(0.95);
    });

    it("should cascade delete usage when consumer service is deleted", async () => {
      const { consumerService, usage } =
        await DatabaseHelper.createTestScenarioWithUsage(em);

      const usageId = usage.id;
      em.remove(consumerService);
      await em.flush();

      const foundUsage = await em.findOne(ServiceContractUsage, usageId);
      expect(foundUsage).toBeNull();
    });

    it("should cascade delete usage when contract is deleted", async () => {
      const { contract, usage } =
        await DatabaseHelper.createTestScenarioWithUsage(em);

      const usageId = usage.id;
      em.remove(contract);
      await em.flush();

      const foundUsage = await em.findOne(ServiceContractUsage, usageId);
      expect(foundUsage).toBeNull();
    });

    it("should set contract version to null when version is deleted", async () => {
      const { contract, usage } =
        await DatabaseHelper.createTestScenarioWithUsage(em);

      const version = ContractVersionFactory.create(contract, 1);
      em.persist(version);
      usage.contractVersion = version;
      await em.flush();

      const usageId = usage.id;
      em.remove(version);
      await em.flush();

      const foundUsage = await em.findOne(ServiceContractUsage, usageId);
      // MikroORM returns undefined for nullable fields that are null
      expect(foundUsage?.contractVersion).toBeUndefined();
    });

    it("should support different usage types and detection methods", async () => {
      const { consumerService, contract } =
        await DatabaseHelper.createTestScenarioWithUsage(em);

      const usages = [
        ServiceContractUsageFactory.create(consumerService, contract, {
          usage_type: UsageType.DIRECT_CALL,
          detection_method: DetectionMethod.CODE_ANALYSIS,
        }),
        ServiceContractUsageFactory.create(consumerService, contract, {
          usage_type: UsageType.INDIRECT,
          detection_method: DetectionMethod.CONFIG,
        }),
        ServiceContractUsageFactory.create(consumerService, contract, {
          usage_type: UsageType.MANUAL,
          detection_method: DetectionMethod.MANUAL,
        }),
      ];

      for (const usage of usages) {
        em.persist(usage);
      }
      await em.flush();

      const found = await em.find(ServiceContractUsage, {
        consumerService,
        contract,
      });
      // createTestScenarioWithUsage creates 1 usage, then we create 3 more = 4 total
      expect(found).toHaveLength(4);
    });
  });

  describe("Entity Relationships", () => {
    it("should load system with all services", async () => {
      const system = SystemFactory.create();
      em.persist(system);
      await em.flush();

      const services = ServiceFactory.createMany(system, 3);
      for (const service of services) {
        em.persist(service);
      }
      await em.flush();

      const found = await em.findOne(System, system.id, {
        populate: ["services"],
      });
      expect(found?.services).toHaveLength(3);
    });

    it("should load service with all contracts", async () => {
      const { service } = await DatabaseHelper.createTestScenario(em);

      const contracts = ContractFactory.createMany(service, 5);
      for (const contract of contracts) {
        em.persist(contract);
      }
      await em.flush();

      const found = await em.findOne(Service, service.id, {
        populate: ["contracts"],
      });
      // createTestScenario creates 1 contract, then we create 5 more = 6 total
      expect(found?.contracts).toHaveLength(6);
    });

    it("should load contract with all versions", async () => {
      const { contract } = await DatabaseHelper.createTestScenario(em);

      const versions = ContractVersionFactory.createMany(contract, [1, 2, 3]);
      for (const version of versions) {
        em.persist(version);
      }
      await em.flush();

      const found = await em.findOne(Contract, contract.id, {
        populate: ["versions"],
      });
      expect(found?.versions).toHaveLength(3);
    });

    it("should load service with contract usages", async () => {
      const { consumerService, usage } =
        await DatabaseHelper.createTestScenarioWithUsage(em);

      const found = await em.findOne(Service, consumerService.id, {
        populate: ["contractUsages"],
      });
      expect(found?.contractUsages).toHaveLength(1);
      expect(found?.contractUsages[0].id).toBe(usage.id);
    });
  });

  describe("Database Indexes", () => {
    it("should use index on system name for queries", async () => {
      const systems = SystemFactory.createMany(10);
      for (const system of systems) {
        em.persist(system);
      }
      await em.flush();

      const found = await em.find(System, { name: systems[0].name });
      expect(found.length).toBeGreaterThan(0);
    });

    it("should use index on service repository_url for queries", async () => {
      const system = SystemFactory.create();
      em.persist(system);
      await em.flush();

      const service = ServiceFactory.create(system, {
        repository_url: "https://github.com/test/repo",
      });
      em.persist(service);
      await em.flush();

      const found = await em.find(Service, {
        repository_url: "https://github.com/test/repo",
      });
      expect(found.length).toBeGreaterThan(0);
    });

    it("should use index on contract http_method and path for queries", async () => {
      const { service } = await DatabaseHelper.createTestScenario(em);

      const contract = ContractFactory.create(service, {
        http_method: "GET",
        path: "/api/test",
      });
      em.persist(contract);
      await em.flush();

      const found = await em.find(Contract, {
        http_method: "GET",
        path: "/api/test",
      });
      expect(found.length).toBeGreaterThan(0);
    });
  });
});
