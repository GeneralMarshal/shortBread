import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateUrlDto } from './dtos/create-url.dto';
import { Body, Get, Param } from '@nestjs/common';
import { UrlsService } from './urls.service';

@Controller('urls')
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
}
