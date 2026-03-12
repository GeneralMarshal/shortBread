import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueuesModule } from 'src/queues/queues.module';
import { AnalyticsProcessor } from './analytics.processor';

@Module({
  imports: [QueuesModule],
  providers: [PrismaService, AnalyticsService, AnalyticsProcessor],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
