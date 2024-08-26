import { Module } from '@nestjs/common';
import { UsageModule } from '@nstrct.me/subscription-manager';
import { TasksService } from './tasks.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(), UsageModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
