import { Controller, UseGuards, Get, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('self')
  async getSelf(@Req() req: Request) {
    const user = req.user as { userId: string; email: string; role: string };
    const userId = user.userId;
    return await this.usersService.getSelf(userId);
  }
}
