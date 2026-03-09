import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dtos/create-webhook.dto';
import { JwtUser } from 'src/auth/jwt.strategy';
import { User } from 'src/common/decorators/user.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('webhook')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateWebhookDto, @User() user: JwtUser) {
    return await this.webhooksService.create(dto, user.userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(@User() user: JwtUser) {
    return await this.webhooksService.getAll(user.userId);
  }
}
