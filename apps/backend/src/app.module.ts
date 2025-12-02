import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validate } from "./config/env.validation";
import { DatabaseModule } from "./database/database.module";
import { RedisModule } from "./redis/redis.module";
import { QueueModule } from "./queue/queue.module";
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
    DatabaseModule,
    RedisModule,
    QueueModule,
    SystemsModule,
    ServicesModule,
    ContractsModule,
    IndexerModule,
    ExtractorModule,
    AnalyzerModule,
    VisualizationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
