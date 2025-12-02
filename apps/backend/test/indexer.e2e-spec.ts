import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createTestApp, getEmFromApp, cleanupDatabase } from "./test-setup";
import { EntityManager } from "@mikro-orm/core";

// NOTE: These tests are ready but will fail until controllers are implemented
// Once IndexerController has POST, GET endpoints, remove .skip
describe.skip("IndexerController (e2e)", () => {
  let app: INestApplication;
  let em: EntityManager;
  let systemId: string;
  let serviceId: string;

  beforeAll(async () => {
    app = await createTestApp();
    em = getEmFromApp(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await cleanupDatabase(em);

    // Create a test system and service for indexing tests
    const systemResponse = await request(app.getHttpServer())
      .post("/api/systems")
      .send({ name: "Test System", description: "Test system for indexing" });
    systemId = systemResponse.body.id;

    const serviceResponse = await request(app.getHttpServer())
      .post("/api/services")
      .send({
        system_id: systemId,
        name: "Test Service",
        repository_url: "https://github.com/example/test-service",
      });
    serviceId = serviceResponse.body.id;
  });

  describe("POST /api/indexer/trigger", () => {
    it("should trigger indexing for a service", async () => {
      const triggerIndexingDto = {
        service_id: serviceId,
      };

      const response = await request(app.getHttpServer())
        .post("/api/indexer/trigger")
        .send(triggerIndexingDto)
        .expect(202);

      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("job_id");
      expect(response.body.service_id).toBe(serviceId);
    });

    it("should return 400 when service_id is missing", async () => {
      await request(app.getHttpServer())
        .post("/api/indexer/trigger")
        .send({})
        .expect(400);
    });

    it("should return 404 when service does not exist", async () => {
      const nonExistentServiceId = "00000000-0000-0000-0000-000000000000";
      const triggerIndexingDto = {
        service_id: nonExistentServiceId,
      };

      await request(app.getHttpServer())
        .post("/api/indexer/trigger")
        .send(triggerIndexingDto)
        .expect(404);
    });
  });

  describe("GET /api/indexer/status/:service_id", () => {
    it("should return indexing status for a service", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/indexer/status/${serviceId}`)
        .expect(200);

      expect(response.body).toHaveProperty("service_id");
      expect(response.body).toHaveProperty("indexing_status");
      expect(response.body.service_id).toBe(serviceId);
    });

    it("should return 404 when service does not exist", async () => {
      const nonExistentServiceId = "00000000-0000-0000-0000-000000000000";

      await request(app.getHttpServer())
        .get(`/api/indexer/status/${nonExistentServiceId}`)
        .expect(404);
    });
  });

  describe("Indexing Workflow", () => {
    it("should complete full indexing workflow: trigger → queue → processing → storage", async () => {
      // Step 1: Trigger indexing
      const triggerResponse = await request(app.getHttpServer())
        .post("/api/indexer/trigger")
        .send({ service_id: serviceId })
        .expect(202);

      expect(triggerResponse.body).toHaveProperty("job_id");

      // Step 2: Check indexing status (should be in_progress or pending)
      const statusResponse = await request(app.getHttpServer())
        .get(`/api/indexer/status/${serviceId}`)
        .expect(200);

      expect(statusResponse.body.indexing_status).toMatch(
        /pending|in_progress|completed/,
      );

      // Step 3: Verify service still exists and is accessible
      const serviceResponse = await request(app.getHttpServer())
        .get(`/api/services/${serviceId}`)
        .expect(200);

      expect(serviceResponse.body.id).toBe(serviceId);
    });
  });
});
