import { EnvService } from '@/config/env.service';
import { Injectable } from '@nestjs/common';
import { writeFileSync } from 'fs';

export interface Indexes {
  contentUrl: string;
  title: string;
}

@Injectable()
export class IndexingService {
  public constructor(private readonly envService: EnvService) {}

  public async getMovies(): Promise<Indexes[]> {
    const uri = this.envService.get('API_URL').concat('/mapafilmes.html');
    const response = await fetch(uri, {
      method: 'GET',
      headers: { 'referer-policy': 'strict-origin-when-cross-origin' },
    });

    const html = response.ok ? await response.text() : '';

    const contentRegex = /\n([\s\S]*?)<br\s*\/>/g;
    const titleRegex = /(.*?)<a\s*href="*"/;
    const contentUrlRegex = /<a\s*href="(.*?)"/;

    const matches = [...html.matchAll(contentRegex)];
    const results = matches
      .map((match) => {
        const content = match[1];
        const contentUrl = contentUrlRegex.exec(content)?.[1] ?? '';
        const title = titleRegex.exec(content)?.[1] ?? '';

        if (contentUrl && contentUrl !== './index.html' && title) {
          return { contentUrl, title };
        }
      })
      .filter(Boolean) as Indexes[];

    return results;
  }

  public async getSeries(): Promise<Indexes[]> {
    const uri = this.envService.get('API_URL').concat('/mapa.html');
    const response = await fetch(uri, {
      method: 'GET',
      headers: { 'referer-policy': 'strict-origin-when-cross-origin' },
    });

    const html = response.ok ? await response.text() : '';

    const contentRegex = /\n([\s\S]*?)<br\s*\/>/g;
    const titleRegex = /(.*?)<a\s*href="*"/;
    const contentUrlRegex = /<a\s*href="(.*?)"/;

    const matches = [...html.matchAll(contentRegex)];
    const results = matches
      .map((match) => {
        const content = match[1];
        const contentUrl = contentUrlRegex.exec(content)?.[1] ?? '';
        const title = titleRegex.exec(content)?.[1] ?? '';

        if (contentUrl && contentUrl !== './index.html' && title) {
          return { contentUrl, title };
        }
      })
      .filter(Boolean) as Indexes[];

    return results;
  }
}
