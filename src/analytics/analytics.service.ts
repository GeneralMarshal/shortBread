import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClickMeta } from 'src/urls/urls.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

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
