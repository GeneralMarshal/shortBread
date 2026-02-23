import { GoneException, Injectable, NotFoundException } from '@nestjs/common';
import generateShortBread from '../utils/short-code';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUrlDto } from './dtos/create-url.dto';
import { Prisma } from 'generated/prisma/client';
@Injectable()
export class UrlsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const allShortBreads = await this.prisma.shortUrl.findMany({
      orderBy: {
        createAt: 'desc',
      },
    });
    if (!allShortBreads) {
      throw new NotFoundException('No short URLs found');
    }
    return allShortBreads;
  }
  async create(dto: CreateUrlDto) {
    if (!dto.longUrl) {
      throw new BadRequestException('Long URL is required');
    }
    const shortUrl = generateShortBread();
    const createUrl = await this.prisma.shortUrl.create({
      data: {
        longUrl: dto.longUrl,
        shortCode: shortUrl,
        ...(dto.expirationTime && { expiresAt: dto.expirationTime }),
      },
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
    const isExpired = longUrl.expiresAt && longUrl.expiresAt < new Date();
    if (isExpired) {
      throw new GoneException('Short URL has expired');
    }

    const updateCount = await this.prisma.shortUrl.update({
      where: { id: longUrl.id },
      data: { clickCount: { increment: 1 } },
    });

    if (!updateCount) {
      throw new BadRequestException('Failed to update click count');
    }
    return {
      longUrl: longUrl.longUrl,
    };
  }

  async delete(code: string) {
    if (!code) {
      throw new BadRequestException('Code is required');
    }
    // const existCode = await this.prisma.shortUrl.findUnique({
    //   where: { shortCode: code },
    // });
    // if (!existCode) {
    //   throw new NotFoundException('Short URL not found');
    // }
    // const deleteCode = await this.prisma.shortUrl.delete({
    //   where: { shortCode: code },
    // });
    // if (!deleteCode) {
    //   throw new BadRequestException('Failed to delete short Url');
    // }
    // return deleteCode;
    try {
      const deleted = await this.prisma.shortUrl.delete({
        where: { shortCode: code },
      });
      return { message: 'Short Url deleted successfully', data: deleted };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Short Url not found');
      }
      throw e;
    }
  }
}
