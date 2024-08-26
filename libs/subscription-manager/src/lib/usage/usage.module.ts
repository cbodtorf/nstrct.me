import { Module } from '@nestjs/common';
import { PrismaModule } from '@nstrct.me/prisma';
import { UsageService } from './usage.service';

@Module({
  imports: [PrismaModule],
  providers: [UsageService],
  exports: [UsageService],
})
export class UsageModule {}
