import { Injectable, NotFoundException } from '@nestjs/common';
import generateShortBread from '../utils/short-code';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UrlsService {
  constructor(private prisma: PrismaService) {}
  async create(longUrl: string) {
    if (!longUrl) {
      throw new BadRequestException('Long URL is required');
    }
    const shortUrl = generateShortBread();
    const createUrl = await this.prisma.shortUrl.create({
      data: { longUrl, shortCode: shortUrl },
    });
    if (!createUrl) {
      throw new BadRequestException('Failed to create short URL');
    }
    return {
      shortUrl: createUrl.shortCode,
    };
  }

  async redirect(code: string) {
    if (!code) {
      throw new BadRequestException('Code is required');
    }
    const longUrl = await this.prisma.shortUrl.findUnique({
      where: { shortCode: code },
    });
    if (!longUrl) {
      throw new NotFoundException('Short URL not found');
    }
    return {
      longUrl: longUrl.longUrl,
    };
  }
}
