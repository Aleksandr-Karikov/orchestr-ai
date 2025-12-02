import { Test, TestingModule } from '@nestjs/testing';
import { ExtractorController } from './extractor.controller';
import { ExtractorService } from './extractor.service';

describe('ExtractorController', () => {
  let controller: ExtractorController;
  let service: ExtractorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtractorController],
      providers: [
        {
          provide: ExtractorService,
          useValue: {
            // Mock service methods will be added when service is implemented
          },
        },
      ],
    }).compile();

    controller = module.get<ExtractorController>(ExtractorController);
    service = module.get<ExtractorService>(ExtractorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have ExtractorService injected', () => {
    expect(service).toBeDefined();
  });
});

