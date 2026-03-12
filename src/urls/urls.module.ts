import { Module } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { AnalyticsModule } from 'src/analytics/analytics.module';
import { WebhookModule } from 'src/webhooks/webhooks.module';
@Module({
  imports: [AuthModule, AnalyticsModule, WebhookModule],
  providers: [UrlsService, PrismaService],
  controllers: [UrlsController],
})
export class UrlsModule {}
