import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Logger } from "../../logger/logger.service";

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let error: string | object = "Internal Server Error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
        error = exceptionResponse;
      } else if (
        typeof exceptionResponse === "object" &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || message;
        error = responseObj.error || error;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Log error with context
    const logContext = {
      method: request.method,
      url: request.url,
      statusCode: status,
      error: error instanceof String ? error : JSON.stringify(error),
      ...(exception instanceof Error && { stack: exception.stack }),
    };

    if (status >= 500) {
      this.logger.error(
        logContext,
        `${request.method} ${request.url} - ${message}`,
      );
    } else {
      this.logger.warn(
        logContext,
        `${request.method} ${request.url} - ${message}`,
      );
    }

    // Format error response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(process.env.NODE_ENV === "development" && {
        error: error instanceof String ? error : JSON.stringify(error),
        ...(exception instanceof Error && { stack: exception.stack }),
      }),
    };

    response.status(status).json(errorResponse);
  }
}
