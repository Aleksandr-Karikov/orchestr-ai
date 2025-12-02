import { Controller, Get } from "@nestjs/common";
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
} from "@nestjs/terminus";
import { DatabaseHealthIndicator } from "./indicators/database.health";
import { RedisHealthIndicator } from "./indicators/redis.health";

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly databaseHealthIndicator: DatabaseHealthIndicator,
    private readonly redisHealthIndicator: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.databaseHealthIndicator.isHealthy("database"),
      () => this.redisHealthIndicator.isHealthy("redis"),
    ]);
  }
}
