import { EnvService } from '@/config/env.service';
import { MediaService } from '@/modules/cdn/services/media.service';
import { SourceService } from '@/modules/cdn/services/source.service';
import { hash, unhash } from '@/utils/hashing';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StreamService {
  public constructor(
    private readonly envService: EnvService,
    private readonly mediaService: MediaService,
    private readonly sourceService: SourceService,
  ) {}

  public async getMovieMeta(param: string) {
    const id = String(param.match(/[0-9a-fA-F]+/g)?.[0]);
    const unhashed = unhash(id);
    const media = await this.mediaService.getMovie(unhashed);

    return media;
  }

  public async getSeriesMeta(param: string) {
    const id = String(param.match(/[0-9a-fA-F]+/g)?.[0]);
    const unhashed = unhash(id);
    const media = await this.mediaService.getSeries(unhashed, true);

    return media;
  }

  public async getStream(param: string) {
    const id = String(param.match(/[0-9a-fA-F]+/g)?.[0]);
    const unhashed = unhash(id);
    const url = await this.sourceService.get(unhashed);

    return url;
  }

  /**
   * Format URL to redirect to controller route, improving performance (see controller route).
   */
  public formatUrl(url: string) {
    return this.envService
      .get('APP_URL')
      .concat('/stream/watch/'.concat(hash(url)));
  }

  /**
   * Dealing with a proxy to bypass DNS or VPN issues.
   */
  public proxyUrl(url: string) {
    if (this.envService.get('PROXY_URL')) {
      return this.envService.get('PROXY_URL').concat(encodeURIComponent(url));
    }

    return url;
  }
}
