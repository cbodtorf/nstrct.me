import { Module } from '@nestjs/common';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { PrismaModule } from '@nstrct.me/prisma';
import { ShortenerProducer } from './producer/shortener.producer';
import { QueueManagerModule, QueueManagerService } from '@nstrct.me/queue-manager';
import { SafeUrlModule } from '@nstrct.me/safe-url';
import { UsageModule } from '@nstrct.me/subscription-manager';
@Module({
  imports: [PrismaModule, QueueManagerModule, SafeUrlModule.forRootAsync(), UsageModule],
  controllers: [ShortenerController],
  providers: [ShortenerService, QueueManagerService, ShortenerProducer],
  exports: [ShortenerService],
})
export class ShortenerModule {}
