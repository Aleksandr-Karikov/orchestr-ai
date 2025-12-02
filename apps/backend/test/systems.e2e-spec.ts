import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createTestApp, getEmFromApp, cleanupDatabase } from "./test-setup";
import { EntityManager } from "@mikro-orm/core";

// NOTE: These tests are ready but will fail until controllers are implemented
// Once SystemsController has POST, GET, PUT, DELETE endpoints, remove .skip
describe.skip("SystemsController (e2e)", () => {
  let app: INestApplication;
  let em: EntityManager;

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
  });

  describe("POST /api/systems", () => {
    it("should create a new system", async () => {
      const createSystemDto = {
        name: "Test System",
        description: "Test system description",
      };

      const response = await request(app.getHttpServer())
        .post("/api/systems")
        .send(createSystemDto)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(createSystemDto.name);
      expect(response.body.description).toBe(createSystemDto.description);
      expect(response.body).toHaveProperty("created_at");
      expect(response.body).toHaveProperty("updated_at");
    });

    it("should create a system without description", async () => {
      const createSystemDto = {
        name: "Test System Without Description",
      };

      const response = await request(app.getHttpServer())
        .post("/api/systems")
        .send(createSystemDto)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(createSystemDto.name);
    });

    it("should return 400 when name is missing", async () => {
      const createSystemDto = {
        description: "Test description without name",
      };

      await request(app.getHttpServer())
        .post("/api/systems")
        .send(createSystemDto)
        .expect(400);
    });
  });

  describe("GET /api/systems", () => {
    it("should return an empty array when no systems exist", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/systems")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it("should return all systems", async () => {
      // Create test systems
      const system1 = { name: "System 1", description: "Description 1" };
      const system2 = { name: "System 2", description: "Description 2" };

      await request(app.getHttpServer()).post("/api/systems").send(system1);
      await request(app.getHttpServer()).post("/api/systems").send(system2);

      const response = await request(app.getHttpServer())
        .get("/api/systems")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe("GET /api/systems/:id", () => {
    it("should return a system by id", async () => {
      const createSystemDto = {
        name: "Test System",
        description: "Test description",
      };

      const createResponse = await request(app.getHttpServer())
        .post("/api/systems")
        .send(createSystemDto)
        .expect(201);

      const systemId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/api/systems/${systemId}`)
        .expect(200);

      expect(response.body.id).toBe(systemId);
      expect(response.body.name).toBe(createSystemDto.name);
      expect(response.body.description).toBe(createSystemDto.description);
    });

    it("should return 404 when system does not exist", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      await request(app.getHttpServer())
        .get(`/api/systems/${nonExistentId}`)
        .expect(404);
    });
  });

  describe("PUT /api/systems/:id", () => {
    it("should update a system", async () => {
      const createSystemDto = {
        name: "Original System",
        description: "Original description",
      };

      const createResponse = await request(app.getHttpServer())
        .post("/api/systems")
        .send(createSystemDto)
        .expect(201);

      const systemId = createResponse.body.id;

      const updateSystemDto = {
        name: "Updated System",
        description: "Updated description",
      };

      const response = await request(app.getHttpServer())
        .put(`/api/systems/${systemId}`)
        .send(updateSystemDto)
        .expect(200);

      expect(response.body.id).toBe(systemId);
      expect(response.body.name).toBe(updateSystemDto.name);
      expect(response.body.description).toBe(updateSystemDto.description);
    });

    it("should return 404 when system does not exist", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      const updateSystemDto = {
        name: "Updated System",
      };

      await request(app.getHttpServer())
        .put(`/api/systems/${nonExistentId}`)
        .send(updateSystemDto)
        .expect(404);
    });
  });

  describe("DELETE /api/systems/:id", () => {
    it("should delete a system", async () => {
      const createSystemDto = {
        name: "System to Delete",
        description: "This system will be deleted",
      };

      const createResponse = await request(app.getHttpServer())
        .post("/api/systems")
        .send(createSystemDto)
        .expect(201);

      const systemId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/api/systems/${systemId}`)
        .expect(200);

      // Verify system is deleted
      await request(app.getHttpServer())
        .get(`/api/systems/${systemId}`)
        .expect(404);
    });

    it("should return 404 when system does not exist", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      await request(app.getHttpServer())
        .delete(`/api/systems/${nonExistentId}`)
        .expect(404);
    });
  });
});
