import {
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import generateShortBread from '../utils/short-code';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUrlDto } from './dtos/create-url.dto';
import { Prisma } from 'generated/prisma/client';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';
import { UpdateUrlDto } from './dtos/update-url.dto';

interface CachedUrl {
  longUrl: string;
  expiresAt: string | null;
}
@Injectable()
export class UrlsService {
  private readonly logger = new Logger(UrlsService.name);
  constructor(
    private prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

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

  async getByOwner(userId: string) {
    const ownerShortBreads = await this.prisma.shortUrl.findMany({
      orderBy: {
        createAt: 'desc',
      },
      where: {
        ownerId: userId,
      },
    });
    if (!ownerShortBreads) {
      throw new BadRequestException('No short URLs found');
    }
    return ownerShortBreads;
  }

  async create(dto: CreateUrlDto, userId: string) {
    if (!dto.longUrl) {
      throw new BadRequestException('Long URL is required');
    }
    const shortUrl = generateShortBread();
    const createUrl = await this.prisma.shortUrl.create({
      data: {
        longUrl: dto.longUrl,
        shortCode: shortUrl,
        ...(dto.expirationTime && { expiresAt: dto.expirationTime }),
        ownerId: userId,
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

    const cached = await this.redis.get(`short:${code}`);

    if (cached) {
      const { longUrl, expiresAt } = JSON.parse(cached) as CachedUrl;

      const isExpired = expiresAt && new Date(expiresAt) < new Date();

      if (isExpired) {
        try {
          await this.redis.del(`short:${code}`);
        } catch (error) {
          this.logger.warn('Redis delete failed', error);
        }
        throw new GoneException('Short URL has expired');
      }

      this.prisma.shortUrl
        .update({
          where: { shortCode: code },
          data: {
            clickCount: { increment: 1 },
          },
        })
        .catch((error) => {
          this.logger.warn('Failed to increment click count', error);
        });

      return {
        longUrl,
      };
    }

    const shortUrl = await this.prisma.shortUrl.findUnique({
      where: { shortCode: code },
    });
    if (!shortUrl) {
      throw new NotFoundException('Short URL not found');
    }
    const isExpired = shortUrl.expiresAt && shortUrl.expiresAt < new Date();
    if (isExpired) {
      throw new GoneException('Short URL has expired');
    }

    this.prisma.shortUrl
      .update({
        where: { id: shortUrl.id },
        data: { clickCount: { increment: 1 } },
      })
      .catch((error) => {
        this.logger.warn('Failed to increment click count', error);
      });

    try {
      console.log(`setting cache for ${code}`);
      await this.redis.set(
        `short:${code}`,
        JSON.stringify({
          longUrl: shortUrl.longUrl,
          expiresAt: shortUrl.expiresAt,
        }),
        'EX',
        3600,
      );
      console.log('caching successful');
    } catch (error) {
      console.log('caching failed');
      this.logger.warn('Redis set failed', error);
    }
    return {
      longUrl: shortUrl.longUrl,
    };
  }

  async delete(code: string, userId: string) {
    if (!code) {
      throw new BadRequestException('Code is required');
    }

    const existCode = await this.prisma.shortUrl.findUnique({
      where: { shortCode: code },
    });
    if (!existCode) {
      throw new NotFoundException('Short URL not found');
    }
    if (existCode.ownerId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this short URL',
      );
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
      await this.redis.del(`short:${code}`).catch((error) => {
        this.logger.warn('Failed to invalidate code in cache', error);
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

  async update(code: string, dto: UpdateUrlDto, userId: string) {
    const existCode = await this.prisma.shortUrl.findUnique({
      where: { shortCode: code },
    });
    if (!existCode) {
      throw new NotFoundException('Short URL not found');
    }
    if (existCode.ownerId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this short URL',
      );
    }
    try {
      const udpated = await this.prisma.shortUrl.update({
        where: {
          shortCode: code,
        },
        data: {
          ...(dto.longUrl && { longUrl: dto.longUrl }),
          ...(dto.expirationTime && { expiresAt: dto.expirationTime }),
        },
      });
      await this.redis.del(`short:${code}`).catch((error) => {
        this.logger.warn('Failed to invalidate code in cache', error);
      });
      return {
        message: `Short Url ${code} updated successfully`,
        data: udpated,
      };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Short Url not found');
      }
    }
  }
}
