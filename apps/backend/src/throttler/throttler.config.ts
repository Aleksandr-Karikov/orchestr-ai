import { ThrottlerModuleOptions } from "@nestjs/throttler";
import { ConfigService } from "@nestjs/config";

export const getThrottlerConfig = (
  _configService: ConfigService,
): ThrottlerModuleOptions => {
  return {
    throttlers: [
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute (default)
      },
    ],
  };
};

// Rate limit configurations for different operation types
export const RATE_LIMITS = {
  DEFAULT: { ttl: 60000, limit: 100 }, // 100 requests per minute
  INDEXING: { ttl: 60000, limit: 10 }, // 10 requests per minute (low limit for indexing operations)
  VISUALIZATION: { ttl: 60000, limit: 200 }, // 200 requests per minute (high limit for graph visualization)
  CONTRACT_EDITING: { ttl: 60000, limit: 50 }, // 50 requests per minute (medium limit for contract editing)
} as const;
