import { Injectable, LoggerService as NestLoggerService } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class Logger implements NestLoggerService {
  constructor(private readonly logger: PinoLogger) {}

  log(message: string, context?: string) {
    this.logger.info({ context }, message);
  }

  // Overload for structured logging with context object
  error(context: Record<string, unknown>, message: string): void;
  // Overload for standard NestJS LoggerService interface
  error(message: string, trace?: string, context?: string): void;
  // Implementation
  error(
    messageOrContext: string | Record<string, unknown>,
    traceOrMessage?: string,
    context?: string,
  ): void {
    // If first argument is an object, it's structured logging
    if (
      typeof messageOrContext === "object" &&
      messageOrContext !== null &&
      traceOrMessage !== undefined
    ) {
      this.logger.error(
        messageOrContext as Record<string, unknown>,
        traceOrMessage,
      );
      return;
    }
    // Otherwise, it's standard logging
    this.logger.error(
      { context, trace: traceOrMessage },
      messageOrContext as string,
    );
  }

  // Overload for structured logging with context object
  warn(context: Record<string, unknown>, message: string): void;
  // Overload for standard NestJS LoggerService interface
  warn(message: string, context?: string): void;
  // Implementation
  warn(
    messageOrContext: string | Record<string, unknown>,
    contextOrMessage?: string,
  ): void {
    // If first argument is an object, it's structured logging
    if (
      typeof messageOrContext === "object" &&
      messageOrContext !== null &&
      contextOrMessage !== undefined
    ) {
      this.logger.warn(
        messageOrContext as Record<string, unknown>,
        contextOrMessage,
      );
      return;
    }
    // Otherwise, it's standard logging
    this.logger.warn({ context: contextOrMessage }, messageOrContext as string);
  }

  debug(message: string, context?: string) {
    this.logger.debug({ context }, message);
  }

  verbose(message: string, context?: string) {
    this.logger.trace({ context }, message);
  }

  /**
   * Log with additional context
   */
  logWithContext(
    level: "log" | "error" | "warn" | "debug" | "verbose",
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ) {
    const logData = { context, ...metadata };

    // Map NestJS log levels to Pino log levels
    switch (level) {
      case "log":
        if (metadata) {
          this.logger.info(logData, message);
        } else {
          this.log(message, context);
        }
        break;
      case "error":
        if (metadata) {
          this.logger.error(logData, message);
        } else {
          this.error(message, undefined, context);
        }
        break;
      case "warn":
        if (metadata) {
          this.logger.warn(logData, message);
        } else {
          this.warn(message, context);
        }
        break;
      case "debug":
        if (metadata) {
          this.logger.debug(logData, message);
        } else {
          this.debug(message, context);
        }
        break;
      case "verbose":
        if (metadata) {
          this.logger.trace(logData, message);
        } else {
          this.verbose(message, context);
        }
        break;
    }
  }
}
