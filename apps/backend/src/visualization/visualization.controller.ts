import { Controller } from '@nestjs/common';
import { VisualizationService } from './visualization.service';

@Controller('visualization')
export class VisualizationController {
  constructor(private readonly visualizationService: VisualizationService) {}
}

