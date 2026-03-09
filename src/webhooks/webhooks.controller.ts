import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dtos/create-webhook.dto';
import { JwtUser } from 'src/auth/jwt.strategy';
import { User } from 'src/common/decorators/user.decorator';
import { UpdateWebhookDto } from './dtos/update-webhook.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('webhooks')
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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(@User() user: JwtUser, @Param('id') id: string) {
    return await this.webhooksService.getById(id, user.userId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @User() user: JwtUser,
    @Body() dto: UpdateWebhookDto,
    @Param('id') id: string,
  ) {
    return await this.webhooksService.update(dto, user.userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @User() user: JwtUser) {
    await this.webhooksService.delete(id, user.userId);
  }
}
