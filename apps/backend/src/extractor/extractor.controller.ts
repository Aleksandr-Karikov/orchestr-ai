import { Controller } from '@nestjs/common';
import { ExtractorService } from './extractor.service';

@Controller('extractor')
export class ExtractorController {
  constructor(private readonly extractorService: ExtractorService) {}
}

