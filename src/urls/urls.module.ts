import { Module } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [UrlsService, PrismaService],
  controllers: [UrlsController],
})
export class UrlsModule {}
