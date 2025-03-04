import { EnvService } from '@/config/env.service';
import { MediaService } from '@/modules/cdn/services/media.service';
import { unhash } from '@/utils/hashing';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetaService {
  public constructor(
    private readonly envService: EnvService,
    private readonly mediaService: MediaService,
  ) {}

  public async getMovieMeta(param: string) {
    const id = String(param.match(/[0-9a-fA-F]+/g)?.[0]);
    const unhashed = unhash(id);
    const media = await this.mediaService.getMovie(unhashed);

    const videoId = 'reflux'.concat(param);
    const posterUrl = this.envService.get('API_URL').concat(media.posterUrl);
    const streamTitle = media.title;

    return {
      id: videoId,
      type: 'movie',
      poster: posterUrl,
      logo: posterUrl,
      background: posterUrl,
      name: streamTitle,
      genres: [],
      trailers: [],
      behaviorHints: {
        defaultVideoId: videoId,
        hasScheduledVideos: false,
      },
    };
  }

  public async getSerieMeta(param: string) {
    const id = String(param.match(/[0-9a-fA-F]+/g)?.[0]);
    const unhashed = unhash(id);
    const media = await this.mediaService.getSerie(unhashed, true);

    const videoId = 'reflux'.concat(param);
    const posterUrl = this.envService.get('API_URL').concat(media.posterUrl);
    const streamTitle = media.title;

    const seasons = media.seasons
      .map((season, i) =>
        season.episodes.map((episode, j) => ({
          id: `${videoId}:${i}:${j}`,
          season: i + 1,
          number: j + 1,
          episode: j + 1,
          name: episode.label,
          thumbnail: posterUrl,
        })),
      )
      .reduce((prev, curr) => [...prev, ...curr], []);

    return {
      id: videoId,
      type: 'series',
      poster: posterUrl,
      logo: posterUrl,
      background: posterUrl,
      name: streamTitle,
      genres: [],
      trailers: [],
      videos: seasons,
      behaviorHints: {
        hasScheduledVideos: false,
      },
    };
  }
}
