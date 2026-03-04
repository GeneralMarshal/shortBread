import { Module } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { AnalyticsService } from 'src/analytics/analytics.service';
@Module({
  imports: [AuthModule],
  providers: [UrlsService, PrismaService, AnalyticsService],
  controllers: [UrlsController],
})
export class UrlsModule {}
