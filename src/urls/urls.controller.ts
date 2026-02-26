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

@ApiBearerAuth()
@Controller('urls')
@UseGuards(AuthGuard('jwt'))
export class UrlsController {
  constructor(private urlsService: UrlsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getAll() {
    return this.urlsService.getAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUrlDto) {
    return this.urlsService.create(dto);
  }

  @Get(':code')
  @HttpCode(HttpStatus.FOUND)
  async redirect(@Param('code') code: string) {
    return this.urlsService.redirect(code);
  }

  @Delete(':code')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('code') code: string) {
    return this.urlsService.delete(code);
  }

  @Patch(':code')
  @HttpCode(HttpStatus.OK)
  async update(@Param('code') code: string, @Body() dto: UpdateUrlDto) {
    return await this.urlsService.update(code, dto);
  }
}
