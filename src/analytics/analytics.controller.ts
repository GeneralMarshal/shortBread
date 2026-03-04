import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { User } from 'src/common/decorators/user.decorator';
import { JwtUser } from 'src/auth/jwt.strategy';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async getAllAnalytics() {
    return await this.analyticsService.getAllAnalytics();
  }

  @Get('owner')
  @HttpCode(HttpStatus.OK)
  async getOwnerAnalytics(@User() user: JwtUser) {
    return await this.analyticsService.getOwnerAnalytics(user.userId);
  }
}
