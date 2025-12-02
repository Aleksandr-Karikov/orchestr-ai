import { Injectable } from "@nestjs/common";
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from "@nestjs/terminus";
import { MikroORM } from "@mikro-orm/core";

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly orm: MikroORM) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const isConnected = await this.orm.isConnected();
      if (!isConnected) {
        throw new Error("Database is not connected");
      }

      // Try to execute a simple query
      const em = this.orm.em.fork();
      await em.getConnection().execute("SELECT 1");

      return this.getStatus(key, true, {
        message: "Database connection is healthy",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Database connection failed";
      throw new HealthCheckError(
        "Database check failed",
        this.getStatus(key, false, { message }),
      );
    }
  }
}
