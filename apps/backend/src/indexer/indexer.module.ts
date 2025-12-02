import { Module } from "@nestjs/common";
import { IndexerController } from "./indexer.controller";
import { IndexerService } from "./indexer.service";
import { GitService } from "./git.service";

@Module({
  controllers: [IndexerController],
  providers: [IndexerService, GitService],
  exports: [IndexerService, GitService],
})
export class IndexerModule {}
