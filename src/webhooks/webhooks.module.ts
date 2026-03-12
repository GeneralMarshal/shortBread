import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { QueuesModule } from 'src/queues/queues.module';
import { WebhooksProcessor } from './webhooks.processor';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [AuthModule, HttpModule, QueuesModule, EmailModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, PrismaService, WebhooksProcessor],
  exports: [WebhooksService],
})
export class WebhookModule {}
