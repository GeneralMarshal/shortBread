import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UrlsModule } from './urls/urls.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [ConfigModule.forRoot(), UrlsModule, RedisModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
