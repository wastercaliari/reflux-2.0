import { MetaService } from '@/routes/meta/meta.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('/meta')
export class MetaController {
  public constructor(private readonly metaService: MetaService) {}

  @Get('/movie/reflux:id.json')
  public async movies(@Param('id') id: string) {
    const meta = await this.metaService.getMovieMeta(id);
    return { meta };
  }

  @Get('/series/reflux:id.json')
  public async series(@Param('id') id: string) {
    const meta = await this.metaService.getSeriesMeta(id);
    return { meta };
  }
}
