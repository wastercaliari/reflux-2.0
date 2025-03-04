import { StreamService } from '@/routes/stream/stream.service';
import { hash } from '@/utils/hashing';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('/stream')
export class StreamController {
  public constructor(private readonly streamService: StreamService) {}

  @Get('/movie/reflux:id.json')
  public async movies(@Param('id') id: string) {
    const meta = await this.streamService.getMovieMeta(id);
    const stream = await this.streamService.getStream(id);

    return {
      streams: [
        {
          name: 'Rede Canais',
          title: meta.title,
          url: stream,
        },
      ],
    };
  }

  @Get('/series/reflux:query.json')
  public async series(@Param('query') query: string) {
    const split = query.split(':') ?? [];

    const id = split[1];
    const season = Number(split[2]);
    const episode = Number(split[3]);

    const meta = await this.streamService.getSerieMeta(id);

    const currentSeason = meta.seasons.find((_, i) => i === season);
    const currentEpisode = currentSeason?.episodes?.find?.(
      (_, i) => i === episode,
    );

    if (!currentSeason || !currentEpisode) {
      return {
        streams: [],
      };
    }

    const streams = await Promise.all(
      currentEpisode.tracks.map(async (track) => ({
        type: track.type,
        url: await this.streamService.getStream(hash(track.url)),
      })),
    );

    return {
      streams: streams.map((stream) => ({
        name: meta.title,
        title: stream.type === 'dubbed' ? 'Dublado' : 'Legendado',
        url: stream.url,
      })),
    };
  }
}
