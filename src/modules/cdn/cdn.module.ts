import { EnvModule } from '@/config/env.module';
import { IndexingService } from '@/modules/cdn/services/indexing.service';
import { ListService } from '@/modules/cdn/services/list.service';
import { MediaService } from '@/modules/cdn/services/media.service';
import { SourceService } from '@/modules/cdn/services/source.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [EnvModule],
  controllers: [],
  providers: [IndexingService, ListService, MediaService, SourceService],
  exports: [IndexingService, ListService, MediaService, SourceService],
})
export class CdnModule {}
