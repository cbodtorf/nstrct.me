import { Global, Module } from '@nestjs/common';
import { AppConfigModule } from '@nstrct.me/config';
import { AppLoggerModule } from '@nstrct.me/logger';
import { VisitsModule } from '../visits/visits.module';

@Global()
@Module({
  imports: [AppConfigModule, AppLoggerModule, VisitsModule],
})
export class AppModule {}
