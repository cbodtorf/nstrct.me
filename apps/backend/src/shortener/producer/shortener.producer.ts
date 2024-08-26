import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProducerService } from '@nstrct.me/queue-manager';
import { AppConfigService } from '@nstrct.me/config';

const SHORTENER_PRODUCER_NAME = 'shortener';

@Injectable()
export class ShortenerProducer extends ProducerService implements OnModuleInit {
  constructor(config: AppConfigService) {
    super(SHORTENER_PRODUCER_NAME, config.getConfig().tracker.stats.topic);
  }

  async onModuleInit() {
    this.init();
  }
}
