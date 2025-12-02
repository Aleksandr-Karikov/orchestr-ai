import { applyDecorators } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { RATE_LIMITS } from "./throttler.config";

/**
 * Apply indexing rate limit (10 requests per minute)
 * Use this decorator on indexing endpoints
 */
export const ThrottleIndexing = () =>
  applyDecorators(
    Throttle({
      default: RATE_LIMITS.INDEXING,
    }),
  );

/**
 * Apply visualization rate limit (200 requests per minute)
 * Use this decorator on graph visualization endpoints
 */
export const ThrottleVisualization = () =>
  applyDecorators(
    Throttle({
      default: RATE_LIMITS.VISUALIZATION,
    }),
  );

/**
 * Apply contract editing rate limit (50 requests per minute)
 * Use this decorator on contract editing endpoints
 */
export const ThrottleContractEditing = () =>
  applyDecorators(
    Throttle({
      default: RATE_LIMITS.CONTRACT_EDITING,
    }),
  );
