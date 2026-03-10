import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWebhookDto } from './dtos/create-webhook.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateWebhookDto } from './dtos/update-webhook.dto';
import { WebhookPayload } from 'src/urls/urls.service';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
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

  async sendForOwner(payload: WebhookPayload) {
    const { ownerId } = payload;

    const activeWebhooks = await this.prisma.webhookSuscription.findMany({
      where: {
        ownerId,
        isActive: true,
      },
    });

    for (const webhook of activeWebhooks) {
      try {
        const headers = {
          'Content-Type': 'application/json',
        };
        if (webhook.secret) {
          headers['X-Webhook-Signature'] = this.SignatureFor(
            webhook.secret,
            payload,
          );
        }
        await this.httpService.axiosRef.post(webhook.targetUrl, payload, {
          headers,
          timeout: 5000,
        });
      } catch (error: any) {
        this.logger.warn(
          `Webhook POST failed for ${webhook.targetUrl}: ${error.message}`,
        );
      }
    }
  }
}
