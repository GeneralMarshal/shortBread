import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CreateUrlDto } from './dtos/create-url.dto';
import { Body, Get, Param, Delete } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { UpdateUrlDto } from './dtos/update-url.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { JwtUser } from 'src/auth/jwt.strategy';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('urls')
export class UrlsController {
  constructor(private urlsService: UrlsService) {}

  @Get()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  getAll() {
    return this.urlsService.getAll();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getByOwner(@User() user: JwtUser) {
    return this.urlsService.getByOwner(user.userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUrlDto, @User() user: JwtUser) {
    return this.urlsService.create(dto, user.userId);
  }

  @Get(':code')
  @HttpCode(HttpStatus.FOUND)
  async redirect(@Param('code') code: string) {
    return this.urlsService.redirect(code);
  }

  @Delete(':code')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('code') code: string, @User() user: JwtUser) {
    return this.urlsService.delete(code, user.userId);
  }

  @Patch(':code')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('code') code: string,
    @Body() dto: UpdateUrlDto,
    @User() user: JwtUser,
  ) {
    return await this.urlsService.update(code, dto, user.userId);
  }
}
