import { AppModule } from '@/app.module';
import { EnvService } from '@/config/env.service';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(EnvService);

  const environment = config.get('NODE_ENV');
  const appPort = config.get('APP_PORT');
  const appUrl = config.get('APP_URL');
  const apiUrl = config.get('API_URL');

  app.enableCors({ origin: '*', allowedHeaders: '*', methods: '*' });
  app.disable('x-powered-by');

  await app.listen(appPort, () => {
    const startDate = new Date().toLocaleString();
    const manifestUrl = `${appUrl}/manifest.json`;

    console.log();
    console.log('🚀 Server was successfully start.');
    console.log(`✨ Manifest URL: ${manifestUrl}`);
    console.log(`🔎 Provider URL: ${apiUrl}`);
    console.log(`🔒 Environment: ${environment}`);
    console.log(`🕒 Started at: ${startDate}`);
    console.log();
  });
}

bootstrap();
