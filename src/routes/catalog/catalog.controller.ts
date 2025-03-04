import { CatalogService } from '@/routes/catalog/catalog.service';
import {
  ManifestService,
  MovieCategoryType,
} from '@/routes/manifest/manifest.service';
import { BadRequestException, Controller, Get, Param } from '@nestjs/common';

@Controller('/catalog')
export class CatalogController {
  public constructor(
    private readonly catalogService: CatalogService,
    private readonly manifestService: ManifestService,
  ) {}

  @Get('/movie/reflux.dubbed/:query?.json')
  public async dubbedMovies(@Param('query') query: string) {
    const params = new URLSearchParams(query);

    const genreParam = params.get('genre');
    const skipParam = params.has('skip') ? Number(params.get('skip')) : 0;
    const searchParam = params.get('search');

    const byCategory = this.manifestService.findMovieCategory('dubbed');
    const byGenre = this.manifestService.findMovieGenre('dubbed', genreParam);

    const url = genreParam ? byGenre.url : byCategory.url;
    const metas = searchParam
      ? await this.catalogService.searchMoviesMeta(searchParam, 30)
      : await this.catalogService.getMoviesMetas(url, skipParam);

    return {
      hasMore: !searchParam,
      cacheMaxAge: 0,
      staleError: 3600,
      staleRevalidate: 3600,
      metas,
    };
  }

  @Get('/movie/reflux.subtitled/:query?.json')
  public async subtitledMovies(@Param('query') query: string) {
    const params = new URLSearchParams(query);

    const genreParam = params.get('genre');
    const skipParam = params.has('skip') ? Number(params.get('skip')) : 0;
    const searchParam = params.get('search');

    const byCategory = this.manifestService.findMovieCategory('subtitled');
    const byGenre = this.manifestService.findMovieGenre(
      'subtitled',
      genreParam,
    );

    const url = genreParam ? byGenre.url : byCategory.url;
    const metas = searchParam
      ? await this.catalogService.searchMoviesMeta(searchParam, 30)
      : await this.catalogService.getMoviesMetas(url, skipParam);

    return {
      hasMore: !searchParam,
      cacheMaxAge: 0,
      staleError: 3600,
      staleRevalidate: 3600,
      metas,
    };
  }

  @Get('/movie/reflux.:type/:query?.json')
  public async otherMovies(
    @Param('type') type: string,
    @Param('query') query: string,
  ) {
    const { data, error } = await MovieCategoryType.safeParseAsync(type);

    if (error) {
      throw new BadRequestException(error);
    }

    const params = new URLSearchParams(query);
    const skipParam = params.has('skip') ? Number(params.get('skip')) : 0;

    const category = this.manifestService.findMovieCategory(data);
    const metas = await this.catalogService.getMoviesMetas(
      category.url,
      skipParam,
    );

    return {
      hasMore: false,
      cacheMaxAge: 0,
      staleError: 3600,
      staleRevalidate: 3600,
      metas,
    };
  }

  @Get('/series/reflux.featured/:query?.json')
  public async featuredSeries(@Param('query') query: string) {
    const params = new URLSearchParams(query);
    const skipParam = params.has('skip') ? Number(params.get('skip')) : 0;

    const category = this.manifestService.findSerieCategory('featured');
    const metas = await this.catalogService.getSeriesMetas(
      category.url,
      skipParam,
    );

    return {
      hasMore: true,
      cacheMaxAge: 0,
      staleError: 3600,
      staleRevalidate: 3600,
      metas,
    };
  }

  @Get('/series/reflux.tv/:query?.json')
  public async tvSeries(@Param('query') query: string) {
    const params = new URLSearchParams(query);

    const genreParam = params.get('genre');
    const skipParam = params.has('skip') ? Number(params.get('skip')) : 0;
    const searchParam = params.get('search');

    const byCategory = this.manifestService.findSerieCategory('tv');
    const byGenre = this.manifestService.findSerieGenre('tv', genreParam);

    const url = genreParam ? byGenre.url : byCategory.url;
    const metas = searchParam
      ? await this.catalogService.searchSeriesMeta(searchParam, 30)
      : await this.catalogService.getSeriesMetas(url, skipParam);

    return {
      hasMore: !searchParam,
      cacheMaxAge: 0,
      staleError: 3600,
      staleRevalidate: 3600,
      metas,
    };
  }

  @Get('/series/reflux.animes/:query?.json')
  public async animesSeries(@Param('query') query: string) {
    const params = new URLSearchParams(query);

    const genreParam = params.get('genre');
    const skipParam = params.has('skip') ? Number(params.get('skip')) : 0;
    const searchParam = params.get('search');

    const byCategory = this.manifestService.findSerieCategory('animes');
    const byGenre = this.manifestService.findSerieGenre('animes', genreParam);

    const url = genreParam ? byGenre.url : byCategory.url;
    const metas = searchParam
      ? await this.catalogService.searchSeriesMeta(searchParam, 30)
      : await this.catalogService.getSeriesMetas(url, skipParam);

    return {
      hasMore: !searchParam,
      cacheMaxAge: 0,
      staleError: 3600,
      staleRevalidate: 3600,
      metas,
    };
  }
}
