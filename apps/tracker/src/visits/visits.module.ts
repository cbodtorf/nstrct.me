import { Module } from '@nestjs/common';
import { VisitsConsumer } from './visits.consumer';
import { QueueManagerModule, QueueManagerService } from '@nstrct.me/queue-manager';
import { PrismaModule } from '@nstrct.me/prisma';
import { VisitsService } from './visits.service';
import { UsageModule } from '@nstrct.me/subscription-manager';

@Module({
  imports: [PrismaModule, QueueManagerModule, UsageModule],
  providers: [VisitsService, VisitsConsumer, QueueManagerService],
  exports: [VisitsService],
})
export class VisitsModule {}
