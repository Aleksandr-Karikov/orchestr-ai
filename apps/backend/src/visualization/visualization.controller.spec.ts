import { Test, TestingModule } from "@nestjs/testing";
import { VisualizationController } from "./visualization.controller";
import { VisualizationService } from "./visualization.service";

describe("VisualizationController", () => {
  let controller: VisualizationController;
  let service: VisualizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisualizationController],
      providers: [
        {
          provide: VisualizationService,
          useValue: {
            // Mock service methods will be added when service is implemented
          },
        },
      ],
    }).compile();

    controller = module.get<VisualizationController>(VisualizationController);
    service = module.get<VisualizationService>(VisualizationService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should have VisualizationService injected", () => {
    expect(service).toBeDefined();
  });
});
