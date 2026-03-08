import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClickMeta } from 'src/urls/urls.service';
import { Queue } from 'bullmq';
@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('analytics') private readonly analyticsQueue: Queue,
  ) {}

  async recordClick(shortUrlId: string, clickMeta: ClickMeta) {
    const { ip, userAgent, referrer, country } = clickMeta;

    const record = await this.prisma.urlClick.create({
      data: {
        shortUrlId,
        referrer,
        ipAddress: ip,
        userAgent,
        country,
      },
    });

    if (!record) {
      throw new BadRequestException('Could not create click record');
    }

    return record;
  }

  async enqueueClick(shortUrlId: string, meta: ClickMeta) {
    await this.analyticsQueue.add('record-click', { shortUrlId, meta });
  }
  async getAllAnalytics() {
    try {
      return this.prisma.urlClick.findMany({ include: { shortUrl: true } });
    } catch (error) {
      throw new InternalServerErrorException(
        'failed to load anlytics data',
        error,
      );
    }
  }

  async getOwnerAnalytics(id: string) {
    try {
      return this.prisma.urlClick.findMany({
        where: {
          shortUrl: {
            ownerId: id,
          },
        },
        include: {
          shortUrl: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'failed to load anlytics data',
        error,
      );
    }
  }
}
