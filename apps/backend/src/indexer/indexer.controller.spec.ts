import { Test, TestingModule } from "@nestjs/testing";
import { IndexerController } from "./indexer.controller";
import { IndexerService } from "./indexer.service";

describe("IndexerController", () => {
  let controller: IndexerController;
  let service: IndexerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndexerController],
      providers: [
        {
          provide: IndexerService,
          useValue: {
            // Mock service methods will be added when service is implemented
          },
        },
      ],
    }).compile();

    controller = module.get<IndexerController>(IndexerController);
    service = module.get<IndexerService>(IndexerService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should have IndexerService injected", () => {
    expect(service).toBeDefined();
  });
});
