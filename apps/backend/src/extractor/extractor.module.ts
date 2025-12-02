import { Module } from "@nestjs/common";
import { ExtractorController } from "./extractor.controller";
import { ExtractorService } from "./extractor.service";
import { SpringBootParser } from "./parsers/spring-boot/spring-boot.parser";

@Module({
  controllers: [ExtractorController],
  providers: [ExtractorService, SpringBootParser],
  exports: [ExtractorService],
})
export class ExtractorModule {}
