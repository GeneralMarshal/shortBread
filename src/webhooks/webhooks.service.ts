import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWebhookDto } from './dtos/create-webhook.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}
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

    if (!webhook) {
      throw new BadRequestException('Unable to create Webhook');
    }

    return webhook;
  }

  async getAll(userId: string) {
    const ownerWebhooks = await this.prisma.webhookSuscription.findMany({
      where: {
        ownerId: userId,
      },
    });

    if (!ownerWebhooks) {
      throw new NotFoundException('No Urls found');
    }

    return ownerWebhooks;
  }
}
