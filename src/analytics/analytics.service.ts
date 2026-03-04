import { BadRequestException, Injectable } from '@nestjs/common';
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
}
