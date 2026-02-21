import { Injectable } from '@nestjs/common';
import generateShortBread from '../utils/short-code';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UrlsService {
  create(longUrl: string) {
    if (!longUrl) {
      throw new BadRequestException('Long URL is required');
    }
    const shortUrl = generateShortBread();
    return {
      shortUrl,
    };
  }

  async redirect(code: string) {
    if (!code) {
      throw new BadRequestException('Code is required');
    }
  }
}
