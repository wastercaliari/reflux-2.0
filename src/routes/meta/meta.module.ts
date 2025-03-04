import { EnvModule } from '@/config/env.module';
import { CdnModule } from '@/modules/cdn/cdn.module';
import { MediaService } from '@/modules/cdn/services/media.service';
import { MetaController } from '@/routes/meta/meta.controller';
import { MetaService } from '@/routes/meta/meta.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [EnvModule, CdnModule],
  controllers: [MetaController],
  providers: [MediaService, MetaService],
})
export class MetaModule {}
