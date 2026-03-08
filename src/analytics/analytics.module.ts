import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnalyticsProcessor } from './analytics.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'analytics',
    }),
  ],
  providers: [PrismaService, AnalyticsService, AnalyticsProcessor],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
