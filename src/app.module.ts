import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UrlsModule } from './urls/urls.module';
import { RedisModule } from './redis/redis.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsController } from './analytics/analytics.controller';
import { AnalyticsModule } from './analytics/analytics.module';
import { BullModule } from '@nestjs/bullmq';
import Redis from 'ioredis';
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
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [RedisModule],
      useFactory: (config: ConfigService, redisClient: Redis) => ({
        connection: redisClient,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
      inject: [ConfigService, 'REDIS_CLIENT'],
    }),
    UrlsModule,
    RedisModule,
    UsersModule,
    AuthModule,
    AnalyticsModule,
  ],
  controllers: [AppController, AnalyticsController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    AppService,
    PrismaService,
  ],
})
export class AppModule {}
