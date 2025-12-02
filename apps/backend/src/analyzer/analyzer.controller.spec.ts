import { Test, TestingModule } from '@nestjs/testing';
import { AnalyzerController } from './analyzer.controller';
import { AnalyzerService } from './analyzer.service';

describe('AnalyzerController', () => {
  let controller: AnalyzerController;
  let service: AnalyzerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyzerController],
      providers: [
        {
          provide: AnalyzerService,
          useValue: {
            // Mock service methods will be added when service is implemented
          },
        },
      ],
    }).compile();

    controller = module.get<AnalyzerController>(AnalyzerController);
    service = module.get<AnalyzerService>(AnalyzerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have AnalyzerService injected', () => {
    expect(service).toBeDefined();
  });
});

