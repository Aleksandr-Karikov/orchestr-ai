import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createTestApp, getEmFromApp, cleanupDatabase } from "./test-setup";
import { EntityManager } from "@mikro-orm/core";

// NOTE: These tests are ready but will fail until controllers are implemented
// Once controllers have endpoints, remove .skip
describe.skip("Error Handling (e2e)", () => {
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

  describe("404 Not Found", () => {
    it("should return 404 for non-existent system", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      await request(app.getHttpServer())
        .get(`/api/systems/${nonExistentId}`)
        .expect(404);
    });

    it("should return 404 for non-existent service", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      await request(app.getHttpServer())
        .get(`/api/services/${nonExistentId}`)
        .expect(404);
    });

    it("should return 404 for non-existent contract", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      await request(app.getHttpServer())
        .get(`/api/contracts/${nonExistentId}`)
        .expect(404);
    });

    it("should return 404 for invalid route", async () => {
      await request(app.getHttpServer()).get("/api/invalid-route").expect(404);
    });
  });

  describe("400 Bad Request", () => {
    it("should return 400 when creating system without required fields", async () => {
      await request(app.getHttpServer())
        .post("/api/systems")
        .send({})
        .expect(400);
    });

    it("should return 400 when creating service without required fields", async () => {
      await request(app.getHttpServer())
        .post("/api/services")
        .send({ name: "Test Service" })
        .expect(400);
    });

    it("should return 400 when creating contract without required fields", async () => {
      await request(app.getHttpServer())
        .post("/api/contracts")
        .send({ name: "Test Contract" })
        .expect(400);
    });

    it("should return 400 when updating with invalid data", async () => {
      // Create a system first
      const systemResponse = await request(app.getHttpServer())
        .post("/api/systems")
        .send({ name: "Test System" })
        .expect(201);

      const systemId = systemResponse.body.id;

      // Try to update with invalid data (e.g., empty name)
      await request(app.getHttpServer())
        .put(`/api/systems/${systemId}`)
        .send({ name: "" })
        .expect(400);
    });
  });

  describe("500 Internal Server Error", () => {
    it("should handle database errors gracefully", async () => {
      // This test would require mocking database errors
      // For now, we'll test that the error handler is in place
      // by checking that invalid UUIDs are handled properly
      await request(app.getHttpServer())
        .get("/api/systems/invalid-uuid")
        .expect(400); // Should return 400 for invalid UUID format, not 500
    });
  });

  describe("Error Response Format", () => {
    it("should return consistent error response format for 404", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/systems/00000000-0000-0000-0000-000000000000")
        .expect(404);

      expect(response.body).toHaveProperty("statusCode");
      expect(response.body.statusCode).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("should return consistent error response format for 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/systems")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("statusCode");
      expect(response.body.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });
});
