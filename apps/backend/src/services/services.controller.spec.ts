import { Test, TestingModule } from "@nestjs/testing";
import { ServicesController } from "./services.controller";
import { ServicesService } from "./services.service";

describe("ServicesController", () => {
  let controller: ServicesController;
  let service: ServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: {
            // Mock service methods will be added when service is implemented
          },
        },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
    service = module.get<ServicesService>(ServicesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should have ServicesService injected", () => {
    expect(service).toBeDefined();
  });
});
