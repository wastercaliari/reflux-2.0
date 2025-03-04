import { EnvService } from '@/config/env.service';
import { Meta } from '@/modules/cdn/services/list.service';
import { decrypt } from '@/utils/encryption';
import { hash } from '@/utils/hashing';
import { normalizeText } from '@/utils/strings';
import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as sanatize from 'sanitize-html';

export interface Media {
  posterUrl: string;
  contentUrl: string;
  title: string;
  seasons: Season[];
}

export interface Season {
  title: string;
  episodes: {
    label: string;
    tracks: {
      // I don't have any idea if there's another type of audio track in provider.
      type: 'dubbed' | 'subtitled';
      url: string;
    }[];
  }[];
}

@Injectable()
export class MediaService {
  public constructor(private readonly envService: EnvService) {}

  public async getMovie(url: string): Promise<Media> {
    const { uri, referer } = this.referer(url);
    const response = await fetch(uri, {
      method: 'GET',
      headers: { referer, 'referer-policy': 'strict-origin-when-cross-origin' },
    });

    const html = await response.text();
    const decrypted = decrypt(html);

    const posterRegex = /<link\s*rel="image_src"\s*href="(.*?)"\s*\/>/;
    const contentRegex = /<meta\s*property="og:url"\s*content="(.*?)"\s*\/>/;
    const titleRegex = /<title>(.*?)<\/title>/;

    const posterUrl = posterRegex.exec(decrypted)?.[1] ?? '';
    const contentUrl = contentRegex.exec(decrypted)?.[1] ?? '';
    const title = titleRegex.exec(decrypted)?.[1] ?? '';

    return {
      posterUrl,
      contentUrl,
      title,
      seasons: [],
    };
  }

  public async getSerie(url: string, deep?: boolean): Promise<Media> {
    const { uri, referer } = this.referer(url);
    const response = await fetch(uri, {
      method: 'GET',
      headers: { referer, 'referer-policy': 'strict-origin-when-cross-origin' },
    });

    const html = await response.text();
    const decrypted = decrypt(html);

    const posterRegex = /data-echo="([^"]+)"/;
    const contentRegex =
      /<li\s*class="selected"\>\s*<a href="(.*?)"\s*rel="nofollow">/;
    const titleRegex = /<title>(.*?)<\/title>/;

    const posterUrl = posterRegex.exec(decrypted)?.[1] ?? '';
    const contentUrl = contentRegex.exec(decrypted)?.[1] ?? '';
    const title = titleRegex.exec(decrypted)?.[1] ?? '';

    // Formatting and splitting a completely messed up html into something readable.
    const episodes = deep ? this.split(decrypted) : [];
    const seasons: Season[] = [];

    // Now we convert to something pretty.
    for (const episode of episodes) {
      const seasonIndex = seasons.findIndex(
        (season) => season.title === episode.seasonTitle,
      );

      if (seasonIndex === -1) {
        seasons.push({
          title: episode.seasonTitle,
          episodes: [
            {
              label: episode.episodeTitle,
              tracks: episode.episodeTracks,
            },
          ],
        });
      } else {
        seasons[seasonIndex].episodes.push({
          label: episode.episodeTitle,
          tracks: episode.episodeTracks,
        });
      }
    }

    return {
      posterUrl,
      contentUrl,
      title,
      seasons,
    };
  }

  public formatMovie(content: Media[]) {
    return content.map((media) => ({
      id: `reflux:${hash(media.contentUrl)}`,
      name: media.title,
      type: 'movie',
      poster: this.envService.get('API_URL').concat(media.posterUrl),
      genres: [],
    })) as Meta[];
  }

  public formatSerie(content: Media[]) {
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

  /**
   * Why am I using Cheerio here?
   * Well, when you spend like 16 hours messing up with regex in a completely fucked up site, you might like to try something different.
   *
   * Probably I will change the rest of project to Cheerio instead regex sometime - why din't I did this before:
   * Regex was serving me well, no problems until this point.
   */
  private split(html: string) {
    const episodes: {
      seasonTitle: string;
      episodeTitle: string;
      episodeTracks: {
        type: 'dubbed' | 'subtitled';
        url: string;
      }[];
    }[] = [];

    let $ = cheerio.load(html);

    // There's two types of season episodes structures, here we searching in both (I've found two types, but it can change in future).
    const container =
      $('div.pm-category-description').html()?.trim?.() ??
      $('div[itemprop="description"]').html()?.trim?.() ??
      '';

    // We need to clean provider html response (of course).
    const firstPass = sanatize(container, {
      allowedAttributes: { a: ['href'] },
      allowedTags: ['a', 'span'],
    });

    // Now we're mapping text without tags into paragraph tag.
    const secondPass = sanatize(firstPass, {
      allowedTags: ['a', 'p', 'span'],
      textFilter: (text, tagName) =>
        !/^\s*\/\s*$/.test(text) && /(.|\s)*\S(.|\s)*/.test(text)
          ? !tagName
            ? `<p>${text}</p>`
            : text
          : '',
    });

    // At end, we're creating an span element if doesn't exists (season splitting depends on it).
    const thirdPass =
      secondPass.indexOf('span') === -1
        ? `<span>${Date.now()}</span>`.concat(secondPass)
        : secondPass;

    $ = cheerio.load(thirdPass);

    // We're mapping as "chunks" between span elements.
    $('span').each((_, e1) => {
      const seasonTitle = $(e1).text().trim();

      $(e1)
        .nextUntil('span') // Search until we find another season.
        .each((_, e2) => {
          if ($(e2).is('p')) {
            // Take episode title (paragraph is important because of this).
            const episodeTitle = $(e2).text().trim();

            // Find all anchor elements links and returns it links.
            const episodeTracks = $(e2)
              .nextUntil('p')
              .map((_, e3) => {
                /**
                 * WARNING:
                 * Usually I don't compare text, it can cause mismatching content and can broke the entire service in the future.
                 *
                 * Why am I doing at this time?
                 * As you can see my indignation with this site above, I will save my words and just say this is the only way I known so far.
                 *
                 * TO-DO: please improve this (and everything above).
                 */
                const type: any =
                  normalizeText($(e3).text()) === 'dublado'
                    ? 'dubbed'
                    : 'subtitled';

                const url = $(e3).attr('href');

                return { type, url };
              })
              .toArray();

            episodes.push({
              seasonTitle,
              episodeTitle,
              episodeTracks,
            });
          }
        });
    });

    return episodes;
  }
}
