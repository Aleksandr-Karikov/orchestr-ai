import { Module } from "@nestjs/common";
import { LoggerModule as PinoLoggerModule } from "nestjs-pino";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Logger } from "./logger.service";

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDevelopment = configService.get("NODE_ENV") === "development";
        const logLevel = configService.get("LOG_LEVEL", "info");

        return {
          pinoHttp: {
            level: logLevel,
            transport: isDevelopment
              ? {
                  target: "pino-pretty",
                  options: {
                    colorize: true,
                    singleLine: false,
                    translateTime: "HH:MM:ss Z",
                    ignore: "pid,hostname",
                  },
                }
              : undefined,
            serializers: {
              req: (req) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                query: req.query,
                params: req.params,
              }),
              res: (res) => ({
                statusCode: res.statusCode,
              }),
              err: (err) => ({
                type: err.type,
                message: err.message,
                stack: err.stack,
              }),
            },
            customProps: () => ({
              context: "HTTP",
            }),
            customLogLevel: (req, res, err) => {
              if (res.statusCode >= 400 && res.statusCode < 500) {
                return "warn";
              } else if (res.statusCode >= 500 || err) {
                return "error";
              }
              return "info";
            },
            autoLogging: {
              ignore: (req) => {
                return req.url === "/api/health";
              },
            },
          },
        };
      },
    }),
  ],
  providers: [Logger],
  exports: [Logger],
})
export class LoggerModule {}
