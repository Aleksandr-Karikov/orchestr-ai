import { ConfigService } from "@nestjs/config";
import Redis, { RedisOptions } from "ioredis";

export const getRedisConfig = (configService: ConfigService): RedisOptions => {
  return {
    host: configService.get<string>("REDIS_HOST", "localhost"),
    port: configService.get<number>("REDIS_PORT", 6379),
    password: configService.get<string>("REDIS_PASSWORD"),
    db: configService.get<number>("REDIS_DB", 0),
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: false,
    lazyConnect: false,
  };
};

export const createRedisConnection = (configService: ConfigService): Redis => {
  const config = getRedisConfig(configService);
  const redis = new Redis(config);

  redis.on("connect", () => {
    console.log("Redis: Connected");
  });

  redis.on("ready", () => {
    console.log("Redis: Ready");
  });

  redis.on("error", (error) => {
    console.error("Redis: Connection error", error);
  });

  redis.on("close", () => {
    console.log("Redis: Connection closed");
  });

  redis.on("reconnecting", () => {
    console.log("Redis: Reconnecting...");
  });

  return redis;
};
