import { envSchema } from '@/config/env';
import { EnvService } from '@/config/env.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
