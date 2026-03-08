import { Module } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { AnalyticsModule } from 'src/analytics/analytics.module';
@Module({
  imports: [AuthModule, AnalyticsModule],
  providers: [UrlsService, PrismaService],
  controllers: [UrlsController],
})
export class UrlsModule {}
