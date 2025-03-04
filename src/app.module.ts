import { EnvModule } from '@/config/env.module';
import { CatalogModule } from '@/routes/catalog/catalog.module';
import { ManifestModule } from '@/routes/manifest/manifest.module';
import { MetaModule } from '@/routes/meta/meta.module';
import { StreamModule } from '@/routes/stream/stream.module';
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { createZodValidationPipe } from 'nestjs-zod';
import { join } from 'node:path';

@Module({
  imports: [
    EnvModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      serveRoot: '/public/',
    }),
    CatalogModule,
    ManifestModule,
    MetaModule,
    StreamModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: createZodValidationPipe(),
    },
  ],
})
export class AppModule {}
