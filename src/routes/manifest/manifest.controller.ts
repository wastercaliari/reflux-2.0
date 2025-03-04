import { ManifestService } from '@/routes/manifest/manifest.service';
import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class ManifestController {
  public constructor(private readonly manifestService: ManifestService) {}

  @Get('/manifest.json')
  public async get() {
    return this.manifestService.get();
  }
}
