import { EnvService } from '@/config/env.service';
import { decrypt } from '@/utils/encryption';
import { hash } from '@/utils/hashing';
import { Injectable } from '@nestjs/common';

export interface List {
  posterUrl: string;
  contentUrl: string;
  title: string;
  flags: {
    isNew: boolean;
  };
}

export interface Meta {
  id: string;
  name: string;
  type: 'movie' | 'series';
  poster: string;
  genres: string[];
}

@Injectable()
export class ListService {
  public constructor(private readonly envService: EnvService) {}

  public async build(
    url: string,
    options: { fromPage: number; toPage: number; replace: string },
  ): Promise<List[]> {
    const list: List[] = [];

    for (let i = options.fromPage; i < options.toPage; i++) {
      const offset = String(i + 1);
      const uri = url.split(options.replace).join(offset);
      const content = await this.get(uri);

      list.push(...content);
    }

    return list;
  }

  public async get(url: string): Promise<List[]> {
    const { uri, referer } = this.referer(url);
    const response = await fetch(uri, {
      method: 'GET',
      headers: { referer, 'referer-policy': 'strict-origin-when-cross-origin' },
    });

    const html = await response.text();
    const decrypted = decrypt(html);

    const contentRegex =
      /<div\s*class="pm-video-thumb">([\s\S]*?)<\/a>\s*<\/div>/g;
    const badgeRegex = /<span\s*class="label\s*label-new">(.*?)<\/span>/;
    const posterUrlRegex = /data-echo="([^"]+)"/;
    const titleRegex = /<a\s*href="([^"]+)"[^>]*title="([^"]+)"/;

    const matches = [...decrypted.matchAll(contentRegex)];
    const results = matches.map((match) => {
      const content = match[1];
      const titleMatch = titleRegex.exec(content);
      const posterUrl = posterUrlRegex.exec(content)?.[1] ?? '';
      const contentUrl = titleMatch?.[1] ?? '';
      const title = titleMatch?.[2] ?? '';
      const isNew = !!badgeRegex.exec(content);

      return {
        posterUrl,
        contentUrl,
        title,
        flags: {
          isNew,
        },
      };
    }) as List[];

    return results;
  }

  public formatMovie(content: List[]) {
    return content.map((media) => ({
      id: `reflux:${hash(media.contentUrl)}`,
      name: media.title,
      type: 'movie',
      poster: this.envService.get('API_URL').concat(media.posterUrl),
      genres: [],
    })) as Meta[];
  }

  public formatSeries(content: List[]) {
    return content.map((media) => ({
      id: `reflux:${hash(media.contentUrl)}`,
      name: media.title,
      type: 'series',
      poster: this.envService.get('API_URL').concat(media.posterUrl),
      genres: [],
    })) as Meta[];
  }

  private referer(url: string) {
    const uri = new URL(url, this.envService.get('API_URL'));
    const referer = `${uri.protocol}//${uri.host}`;

    return { uri, referer };
  }
}
