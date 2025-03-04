import { MediaService } from '@/modules/cdn/services/media.service';
import { SourceService } from '@/modules/cdn/services/source.service';
import { unhash } from '@/utils/hashing';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StreamService {
  public constructor(
    private readonly mediaService: MediaService,
    private readonly sourceService: SourceService,
  ) {}

  public async getMovieMeta(param: string) {
    const id = String(param.match(/[0-9a-fA-F]+/g)?.[0]);
    const unhashed = unhash(id);
    const media = await this.mediaService.getMovie(unhashed);

    return media;
  }

  public async getSerieMeta(param: string) {
    const id = String(param.match(/[0-9a-fA-F]+/g)?.[0]);
    const unhashed = unhash(id);
    const media = await this.mediaService.getSerie(unhashed, true);

    return media;
  }

  public async getStream(param: string) {
    const id = String(param.match(/[0-9a-fA-F]+/g)?.[0]);
    const unhashed = unhash(id);
    const url = await this.sourceService.get(unhashed);

    return url;
  }
}
