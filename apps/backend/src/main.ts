import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { AppConfigService } from '@nstrct.me/config';
import { AppLoggerService } from '@nstrct.me/logger';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  app.use(cookieParser());
  app.useBodyParser('json', { limit: '5mb' });
  app.useBodyParser('urlencoded', { limit: '5mb', extended: true });
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Enable DI in class-validator
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const port = app.get(AppConfigService).getConfig().general.backendPort;
  const logger = app.get(AppLoggerService);

  await app.listen(port);

  logger.log(`Starting backend on port ${port}`);
}

bootstrap();
