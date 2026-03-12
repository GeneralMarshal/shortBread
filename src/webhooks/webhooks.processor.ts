import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WebhooksService } from './webhooks.service';
import { ClickMeta } from 'src/urls/urls.service';

type WebhookJobData = {
  shortCode: string;
  meta: ClickMeta;
};

@Processor('events')
export class WebhooksProcessor extends WorkerHost {
  constructor(private readonly webhooksService: WebhooksService) {
    super();
  }

  async process(job: Job<any>) {
    if (job.name === 'send-webhook') {
      const { shortCode, meta } = job.data as WebhookJobData;
      await this.webhooksService.sendForOwner(shortCode, meta);
    }
  }
}
