import { EnvModule } from '@/config/env.module';
import { CdnModule } from '@/modules/cdn/cdn.module';
import { MediaService } from '@/modules/cdn/services/media.service';
import { SourceService } from '@/modules/cdn/services/source.service';
import { StreamController } from '@/routes/stream/stream.controller';
import { StreamService } from '@/routes/stream/stream.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [EnvModule, CdnModule],
  controllers: [StreamController],
  providers: [MediaService, SourceService, StreamService],
})
export class StreamModule {}
