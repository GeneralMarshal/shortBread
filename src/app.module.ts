import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlsModule } from './urls/urls.module';
import { PrismaService } from './prisma/prisma.service';
@Module({
  imports: [UrlsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
