import { IndexingService } from '@/modules/cdn/services/indexing.service';
import { ListService } from '@/modules/cdn/services/list.service';
import { Media, MediaService } from '@/modules/cdn/services/media.service';
import { normalizeText } from '@/utils/strings';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatalogService {
  public constructor(
    private readonly indexingService: IndexingService,
    private readonly listService: ListService,
    private readonly mediaService: MediaService,
  ) {}

  public async getMoviesMetas(url: string, skip: number) {
    const providerReturnSize = 8; // Currently provider return only 8 items per page.
    const takePagesAmount = 5; // We take 5 pages, it will return 40 items per page. (5 x 8)

    // Calculating end page index.
    const endPage =
      ((skip + providerReturnSize * takePagesAmount) /
        (providerReturnSize * takePagesAmount)) *
      takePagesAmount;

    // Calculating start page index, based in end page index.
    const startPage = Math.max(endPage - takePagesAmount, 0);

    /**
     * %page% is a dynamic parameter returned by media provider, it looks like:
     * /browse-filmes-lancamentos-videos-1-date.html
     * /browse-filmes-lancamentos-videos-2-date.html
     */
    const content = await this.listService.build(url, {
      fromPage: startPage,
      toPage: endPage,
      replace: '%page%',
    });

    const metas = this.listService.formatMovie(content);

    return metas;
  }

  public async getSeriesMetas(url: string, skip: number) {
    const providerReturnSize = 8; // Currently provider return only 8 items per page.
    const takePagesAmount = 5; // We take 5 pages, it will return 40 items per page. (5 x 8)

    // Calculating end page index.
    const endPage =
      ((skip + providerReturnSize * takePagesAmount) /
        (providerReturnSize * takePagesAmount)) *
      takePagesAmount;

    // Calculating start page index, based in end page index.
    const startPage = Math.max(endPage - takePagesAmount, 0);

    /**
     * %page% is a dynamic parameter returned by media provider, it looks like:
     * /browse-filmes-lancamentos-videos-1-date.html
     * /browse-filmes-lancamentos-videos-2-date.html
     */
    const content = await this.listService.build(url, {
      fromPage: startPage,
      toPage: endPage,
      replace: '%page%',
    });

    const metas = this.listService.formatSerie(content);

    return metas;
  }

  public async searchMoviesMeta(query: string, limit: number) {
    const queryNormalized = normalizeText(query);
    const indexes = await this.indexingService.getMovies();
    const results: Media[] = [];

    for (let i = 0; i < indexes.length; i++) {
      const index = indexes[i];
      const indexNormalized = normalizeText(index.title);
      const isMatching = indexNormalized.indexOf(queryNormalized) !== -1;
      const reachedLimit = results.length >= limit;

      if (isMatching && !reachedLimit) {
        const media = await this.mediaService.getMovie(index.contentUrl);

        results.push(media);
      }
    }

    const metas = this.mediaService.formatMovie(results);

    return metas;
  }

  public async searchSeriesMeta(query: string, limit: number) {
    const queryNormalized = normalizeText(query);
    const indexes = await this.indexingService.getSeries();
    const results: Media[] = [];

    for (let i = 0; i < indexes.length; i++) {
      const index = indexes[i];
      const indexNormalized = normalizeText(index.title);
      const isMatching = indexNormalized.indexOf(queryNormalized) !== -1;
      const reachedLimit = results.length >= limit;

      if (isMatching && !reachedLimit) {
        const media = await this.mediaService.getSerie(index.contentUrl);

        results.push(media);
      }
    }

    const metas = this.mediaService.formatSerie(results);

    return metas;
  }
}
