import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AnalyticsService } from './analytics.service';
import { ClickMeta } from 'src/urls/urls.service';

type RecordAnalyticsJobData = {
  shortUrlId: string;
  meta: ClickMeta;
};

@Processor('events')
export class AnalyticsProcessor extends WorkerHost {
  constructor(private readonly analyticsService: AnalyticsService) {
    super();
  }

  async process(job: Job<any>) {
    if (job.name === 'record-click') {
      const { shortUrlId, meta } = job.data as RecordAnalyticsJobData;
      await this.analyticsService.recordClick(shortUrlId, meta);
    }
  }
}

