import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AnalyticsService } from './analytics.service';
import { ClickMeta } from 'src/urls/urls.service';

type RecordAnalyticsJobData = {
  shortUrlId: string;
  meta: ClickMeta;
};

@Processor('analytics')
export class AnalyticsProcessor extends WorkerHost {
  constructor(private readonly analyticsService: AnalyticsService) {
    super();
  }

  async process(job: Job<RecordAnalyticsJobData>) {
    if (job.name === 'record-click') {
      const { shortUrlId, meta } = job.data;
      await this.analyticsService.recordClick(shortUrlId, meta);
    }
  }
}
