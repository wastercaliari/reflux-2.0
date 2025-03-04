import { EnvModule } from '@/config/env.module';
import { CdnModule } from '@/modules/cdn/cdn.module';
import { IndexingService } from '@/modules/cdn/services/indexing.service';
import { MediaService } from '@/modules/cdn/services/media.service';
import { CatalogController } from '@/routes/catalog/catalog.controller';
import { CatalogService } from '@/routes/catalog/catalog.service';
import { ManifestService } from '@/routes/manifest/manifest.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [EnvModule, CdnModule],
  controllers: [CatalogController],
  providers: [CatalogService, IndexingService, ManifestService, MediaService],
})
export class CatalogModule {}
