import { EnvModule } from '@/config/env.module';
import { ManifestController } from '@/routes/manifest/manifest.controller';
import { ManifestService } from '@/routes/manifest/manifest.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [EnvModule],
  controllers: [ManifestController],
  providers: [ManifestService],
})
export class ManifestModule {}
