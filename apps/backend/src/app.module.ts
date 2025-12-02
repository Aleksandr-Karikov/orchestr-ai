import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { validate } from "./config/env.validation";
import { DatabaseModule } from "./database/database.module";
import { RedisModule } from "./redis/redis.module";
import { QueueModule } from "./queue/queue.module";
import { LoggerModule } from "./logger/logger.module";
import { HealthModule } from "./health/health.module";
import { ThrottlerConfigModule } from "./throttler/throttler.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SystemsModule } from "./systems/systems.module";
import { ServicesModule } from "./services/services.module";
import { ContractsModule } from "./contracts/contracts.module";
import { IndexerModule } from "./indexer/indexer.module";
import { ExtractorModule } from "./extractor/extractor.module";
import { AnalyzerModule } from "./analyzer/analyzer.module";
import { VisualizationModule } from "./visualization/visualization.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      validate,
      cache: true,
    }),
    LoggerModule,
    ThrottlerConfigModule,
    DatabaseModule,
    RedisModule,
    QueueModule,
    HealthModule,
    SystemsModule,
    ServicesModule,
    ContractsModule,
    IndexerModule,
    ExtractorModule,
    AnalyzerModule,
    VisualizationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
