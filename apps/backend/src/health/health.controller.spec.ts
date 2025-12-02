import { Test, TestingModule } from "@nestjs/testing";
import { HealthCheckService, HealthCheckResult } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { DatabaseHealthIndicator } from "./indicators/database.health";
import { RedisHealthIndicator } from "./indicators/redis.health";

describe("HealthController", () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let databaseHealthIndicator: DatabaseHealthIndicator;
  let redisHealthIndicator: RedisHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn(),
          },
        },
        {
          provide: DatabaseHealthIndicator,
          useValue: {
            isHealthy: jest.fn(),
          },
        },
        {
          provide: RedisHealthIndicator,
          useValue: {
            isHealthy: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    databaseHealthIndicator = module.get<DatabaseHealthIndicator>(
      DatabaseHealthIndicator,
    );
    redisHealthIndicator =
      module.get<RedisHealthIndicator>(RedisHealthIndicator);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("check", () => {
    it("should return healthy status when both database and redis are healthy", async () => {
      const mockHealthResult: HealthCheckResult = {
        status: "ok",
        info: {
          database: {
            status: "up",
            message: "Database connection is healthy",
          },
          redis: {
            status: "up",
            message: "Redis connection is healthy",
          },
        },
        error: {},
        details: {
          database: {
            status: "up",
            message: "Database connection is healthy",
          },
          redis: {
            status: "up",
            message: "Redis connection is healthy",
          },
        },
      };

      jest.spyOn(databaseHealthIndicator, "isHealthy").mockResolvedValue({
        database: {
          status: "up",
          message: "Database connection is healthy",
        },
      });

      jest.spyOn(redisHealthIndicator, "isHealthy").mockResolvedValue({
        redis: {
          status: "up",
          message: "Redis connection is healthy",
        },
      });

      jest
        .spyOn(healthCheckService, "check")
        .mockResolvedValue(mockHealthResult);

      const result = await controller.check();

      expect(result).toEqual(mockHealthResult);
      expect(result.status).toBe("ok");
      expect(result.details.database.status).toBe("up");
      expect(result.details.redis.status).toBe("up");
      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
        expect.any(Function),
      ]);
    });

    it("should return unhealthy status when database is down", async () => {
      const mockHealthResult: HealthCheckResult = {
        status: "error",
        info: {
          redis: {
            status: "up",
            message: "Redis connection is healthy",
          },
        },
        error: {
          database: {
            status: "down",
            message: "Database connection failed",
          },
        },
        details: {
          database: {
            status: "down",
            message: "Database connection failed",
          },
          redis: {
            status: "up",
            message: "Redis connection is healthy",
          },
        },
      };

      jest
        .spyOn(databaseHealthIndicator, "isHealthy")
        .mockRejectedValue(new Error("Database connection failed"));

      jest.spyOn(redisHealthIndicator, "isHealthy").mockResolvedValue({
        redis: {
          status: "up",
          message: "Redis connection is healthy",
        },
      });

      jest
        .spyOn(healthCheckService, "check")
        .mockResolvedValue(mockHealthResult);

      const result = await controller.check();

      expect(result).toEqual(mockHealthResult);
      expect(result.status).toBe("error");
      expect(result.error).toBeDefined();
      expect(result.error?.database.status).toBe("down");
    });

    it("should return unhealthy status when redis is down", async () => {
      const mockHealthResult: HealthCheckResult = {
        status: "error",
        info: {
          database: {
            status: "up",
            message: "Database connection is healthy",
          },
        },
        error: {
          redis: {
            status: "down",
            message: "Redis connection failed",
          },
        },
        details: {
          database: {
            status: "up",
            message: "Database connection is healthy",
          },
          redis: {
            status: "down",
            message: "Redis connection failed",
          },
        },
      };

      jest.spyOn(databaseHealthIndicator, "isHealthy").mockResolvedValue({
        database: {
          status: "up",
          message: "Database connection is healthy",
        },
      });

      jest
        .spyOn(redisHealthIndicator, "isHealthy")
        .mockRejectedValue(new Error("Redis connection failed"));

      jest
        .spyOn(healthCheckService, "check")
        .mockResolvedValue(mockHealthResult);

      const result = await controller.check();

      expect(result).toEqual(mockHealthResult);
      expect(result.status).toBe("error");
      expect(result.error).toBeDefined();
      expect(result.error?.redis.status).toBe("down");
    });

    it("should return unhealthy status when both database and redis are down", async () => {
      const mockHealthResult: HealthCheckResult = {
        status: "error",
        info: {},
        error: {
          database: {
            status: "down",
            message: "Database connection failed",
          },
          redis: {
            status: "down",
            message: "Redis connection failed",
          },
        },
        details: {
          database: {
            status: "down",
            message: "Database connection failed",
          },
          redis: {
            status: "down",
            message: "Redis connection failed",
          },
        },
      };

      jest
        .spyOn(databaseHealthIndicator, "isHealthy")
        .mockRejectedValue(new Error("Database connection failed"));

      jest
        .spyOn(redisHealthIndicator, "isHealthy")
        .mockRejectedValue(new Error("Redis connection failed"));

      jest
        .spyOn(healthCheckService, "check")
        .mockResolvedValue(mockHealthResult);

      const result = await controller.check();

      expect(result).toEqual(mockHealthResult);
      expect(result.status).toBe("error");
      expect(result.error).toBeDefined();
      expect(result.error?.database.status).toBe("down");
      expect(result.error?.redis.status).toBe("down");
    });
  });
});
