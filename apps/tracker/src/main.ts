import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppConfigService } from '@nstrct.me/config';
import { AppModule } from './app/app.module';
import { AppLoggerService } from '@nstrct.me/logger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  app.enableCors({ origin: true, credentials: true });

  const port = app.get(AppConfigService).getConfig().general.trackerPort;
  const logger = app.get(AppLoggerService);

  await app.listen(port);

  logger.log(`Starting tracker on port ${port}`);
}

bootstrap();
