import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UrlsModule } from './urls/urls.module';
import { RedisModule } from './redis/redis.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60 * 1000,
          limit: 30,
        },
      ],
    }),
    ConfigModule.forRoot(),
    UrlsModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    AppService,
    PrismaService,
  ],
})
export class AppModule {}
