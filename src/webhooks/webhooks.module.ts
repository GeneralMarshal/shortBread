import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [AuthModule, HttpModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, PrismaService],
})
export class WebhookModule {}
