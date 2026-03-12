import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWebhookDto } from './dtos/create-webhook.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateWebhookDto } from './dtos/update-webhook.dto';
import { ClickMeta, WebhookPayload } from 'src/urls/urls.service';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { createHmac } from 'crypto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private emailService: EmailService,
    @InjectQueue('events') private readonly eventsQueue: Queue,
  ) {}
  async create(dto: CreateWebhookDto, userId: string) {
    const { targetUrl, secret } = dto;

    const webhook = await this.prisma.webhookSuscription.create({
      data: {
        targetUrl,
        ...(secret && { secret }),
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return webhook;
  }

  async getAll(userId: string) {
    const ownerWebhooks = await this.prisma.webhookSuscription.findMany({
      where: {
        ownerId: userId,
      },
    });

    return ownerWebhooks;
  }

  async getById(id: string, userId: string) {
    const webhook = await this.prisma.webhookSuscription.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return webhook;
  }

  async update(dto: UpdateWebhookDto, userId: string, id: string) {
    const { targetUrl, secret, isActive } = dto;

    const existing = await this.prisma.webhookSuscription.findFirst({
      where: { id, ownerId: userId },
    });

    if (!existing) {
      throw new NotFoundException('Webhook not found');
    }

    const updated = await this.prisma.webhookSuscription.update({
      where: { id },
      data: {
        ...(targetUrl !== undefined && { targetUrl }),
        ...(secret !== undefined && { secret }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return updated;
  }

  async delete(id: string, userId: string) {
    const existing = await this.prisma.webhookSuscription.findFirst({
      where: { id, ownerId: userId },
    });
    if (!existing) {
      throw new NotFoundException('Webhook not found');
    }

    const deleted = await this.prisma.webhookSuscription.delete({
      where: {
        id,
      },
    });

    return deleted;
  }

  async enqueueWebhook(shortCode: string, clickMeta: ClickMeta) {
    await this.eventsQueue.add('send-webhook', {
      shortCode,
      meta: clickMeta,
    });
  }

  private signatureFor(secret: string, payload: WebhookPayload): string {
    const body = JSON.stringify(payload);
    return createHmac('sha256', secret).update(body).digest('hex');
  }

  async sendForOwner(shortCode: string, clickMeta: ClickMeta) {
    const shortUrl = await this.prisma.shortUrl.findUnique({
      where: {
        shortCode,
      },
    });

    if (!shortUrl) {
      this.logger.warn('Short url not found while processing webhook job');
      return;
    }
    // up next is to build payload
    const payload: WebhookPayload = {
      shortUrlId: shortUrl.id,
      shortCode: shortUrl.shortCode,
      longUrl: shortUrl.longUrl,
      ownerId: shortUrl.ownerId,
      clickedAt: new Date().toISOString(),
      meta: clickMeta,
    };

    const owner = await this.prisma.user.findUnique({
      where: {
        id: shortUrl.ownerId,
      },
    });

    if (!owner) {
      throw new NotFoundException('Owner Email not available');
    }

    await this.emailService.sendClickEmail(owner.email, payload);

    // const activeWebhooks = await this.prisma.webhookSuscription.findMany({
    //   where: {
    //     ownerId: shortUrl.ownerId,
    //     isActive: true,
    //   },
    // });

    // for (const webhook of activeWebhooks) {
    //   try {
    //     const headers = {
    //       'Content-Type': 'application/json',
    //     };
    //     if (webhook.secret) {
    //       headers['X-Webhook-Signature'] = this.signatureFor(
    //         webhook.secret,
    //         payload,
    //       );
    //     }
    //     await this.httpService.axiosRef.post(webhook.targetUrl, payload, {
    //       headers,
    //       timeout: 5000,
    //     });
    //   } catch (error: unknown) {
    //     const message = error instanceof Error ? error.message : String(error);
    //     this.logger.warn(
    //       `Webhook POST failed for ${webhook.targetUrl}: ${message}`,
    //     );
    //   }
    // }
  }
}
