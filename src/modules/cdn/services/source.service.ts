import { EnvService } from '@/config/env.service';
import { decrypt } from '@/utils/encryption';
import { Injectable } from '@nestjs/common';
import { toASCII } from 'node:punycode';

@Injectable()
export class SourceService {
  public constructor(private readonly envService: EnvService) {}

  public async get(url: string) {
    const player = await this.fetchPlayer(url);
    const source = await this.fetchSource(player);
    const stream = await this.fetchStream(source);
    const video = await this.fetchVideo(stream);

    return video;
  }

  private async fetchPlayer(url: string) {
    const { uri, referer } = this.referer(url);
    const response = await fetch(uri, {
      method: 'GET',
      headers: { referer, 'referer-policy': 'strict-origin-when-cross-origin' },
    });

    const html = await response.text();
    const decrypted = decrypt(html);

    const iframeMatch = decrypted.match(/<iframe\s+[^>]*src=["']([^"']*)["']/i);
    if (!iframeMatch) throw new Error('Failed to fetch player iframe URL.');

    const parsed = new URL(`${referer}${toASCII(iframeMatch[1])}`).href;
    return parsed;
  }

  private async fetchSource(url: string) {
    const { uri, referer } = this.referer(url);
    const response = await fetch(uri, {
      method: 'GET',
      headers: { referer, 'referer-policy': 'strict-origin-when-cross-origin' },
    });

    const html = await response.text();
    const decrypted = decrypt(html);

    const ajaxMatch = decrypted.match(/\$.ajax\(([\s\S]*?)\);/i);
    if (!ajaxMatch)
      throw new Error('Failed to find AJAX request in source URL.');

    const urlMatch = ajaxMatch[1].match(/url:\s*['"]([^'"]+)['"]/);
    const tokenMatch = ajaxMatch[1].match(/'rctoken':'([^']+)'/);

    if (!urlMatch || !tokenMatch)
      throw new Error('Failed to extract source URL or token.');

    const player = '/player3'; // Arbitrary player identifier.
    const parsed = new URL(urlMatch[1], uri);

    return {
      url: `${player}${parsed.pathname}${parsed.search}`,
      token: tokenMatch[1],
    };
  }

  private async fetchStream(source: { url: string; token: string }) {
    const { uri, referer } = this.referer(source.url);
    const response = await fetch(uri, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        referer,
        'referer-policy': 'strict-origin-when-cross-origin',
      },
      body: `rctoken=${encodeURIComponent(source.token)}`,
    });

    const html = await response.text();
    const vodMatch = html.match(/const\s+VID_URL\s*=\s*["']([^"']+)["']/);

    if (!vodMatch) throw new Error('Failed to retrieve VOD URL.');

    const formatted = new URL(vodMatch[1], uri).href;
    return formatted;
  }

  private async fetchVideo(url: string) {
    const { uri, referer } = this.referer(url);

    const response = await (
      await Promise.resolve(() =>
        fetch(uri, {
          method: 'GET',
          redirect: 'follow',
          headers: { referer },
        })
          .then((response) => response.url)
          .catch((response) => response.url),
      )
    )();

    return response ?? null;
  }

  private referer(url: string) {
    const uri = new URL(url, this.envService.get('API_URL'));
    const referer = `${uri.protocol}//${uri.host}`;

    return { uri, referer };
  }
}
