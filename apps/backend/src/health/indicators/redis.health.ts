import { Injectable, Inject } from "@nestjs/common";
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from "@nestjs/terminus";
import { REDIS_CLIENT } from "../../redis/redis.module";
import Redis from "ioredis";

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const result = await this.redis.ping();
      if (result !== "PONG") {
        throw new Error("Redis ping failed");
      }

      return this.getStatus(key, true, {
        message: "Redis connection is healthy",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Redis connection failed";
      throw new HealthCheckError(
        "Redis check failed",
        this.getStatus(key, false, { message }),
      );
    }
  }
}
