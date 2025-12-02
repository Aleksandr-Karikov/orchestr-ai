import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createTestApp, getEmFromApp } from "./test-setup";
import { EntityManager } from "@mikro-orm/core";

describe("HealthController (e2e)", () => {
  let app: INestApplication;
  let em: EntityManager;

  beforeAll(async () => {
    app = await createTestApp();
    em = getEmFromApp(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /api/health", () => {
    it("should return healthy status when database and redis are up", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/health")
        .expect(200);

      expect(response.body).toHaveProperty("status");
      expect(response.body.status).toBe("ok");
      expect(response.body).toHaveProperty("info");
      expect(response.body.info).toHaveProperty("database");
      expect(response.body.info).toHaveProperty("redis");
      expect(response.body.info.database.status).toBe("up");
      expect(response.body.info.redis.status).toBe("up");
    });

    it("should return proper health check structure", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/health")
        .expect(200);

      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("info");
      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("details");
    });
  });
});
