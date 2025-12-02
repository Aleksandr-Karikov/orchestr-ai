import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { getMikroOrmConfig } from "./mikro-orm.config";

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getMikroOrmConfig(configService),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

